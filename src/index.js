const utilAddress = require('./util/splitAddress')
const fs = require('fs')
/**
 * From jquery.Thailand.js line 38 - 100
 */
const preprocess = function ({ data, lookup, words }) {
  let expanded = []
  let useLookup = false
  let t

  if (lookup && words) {
    // compact with dictionary and lookup
    useLookup = true
    lookup = lookup.split('|')
    words = words.split('|')
  }

  t = function (text) {
    function repl (m) {
      let ch = m.replace(/[{,}]/g, '').charCodeAt(0)

      return words[ch < 97 ? ch - 65 : 26 + ch - 97]
    }
    if (!useLookup) {
      return text
    }
    if (typeof text === 'number') {
      text = lookup[text]
    }
    return text.replace(/\{[A-Z]}/g, repl)
  }

  // decompacted database in hierarchical form of:
  // [["province",[["amphur",[["district",["zip"...]]...]]...]]...]
  data.map(function (provinces) {
    let i = 1
    if (provinces.length === 3) {
      // geographic database
      i = 2
    }

    provinces[i].map(function (amphoes) {
      amphoes[i].map(function (districts) {
        districts[i] =
          districts[i] instanceof Array ? districts[i] : [districts[i]]
        districts[i].map(function (zipcode) {
          let entry = {
            district: t(districts[0]),
            amphoe: t(amphoes[0]),
            province: t(provinces[0]),
            zipcode: zipcode
          }
          if (i === 2) {
            // geographic database
            entry.district_code = districts[1] || false
            entry.amphoe_code = amphoes[1] || false
            entry.province_code = provinces[1] || false
          }
          expanded.push(entry)
        })
      })
    })
  })
  return expanded
}

const db = {
  'en-GB': preprocess(require('../database/db-th-en.json')),
  'th-TH': preprocess(require('../database/db-th-th.json'))
}
const resolveResultbyField = (type, searchStr, maxResult, lang) => {
  searchStr = searchStr.toString().trim()
  if (searchStr === '') {
    return []
  }
  if (!maxResult) {
    maxResult = 20
  }
  let possibles = []
  try {
    possibles = (db[lang] || db['en-GB'])
      .filter((item) => {
        let regex = new RegExp(searchStr, 'ig')
        return (item[type] || '').toString().match(regex)
      })
      .slice(0, maxResult)
  } catch (e) {
    return []
  }
  return possibles
}

const searchAddressByDistrict = (searchStr, maxResult, lang) => {
  return resolveResultbyField('district', searchStr, maxResult, lang)
}
const searchAddressByAmphoe = (searchStr, maxResult, lang) => {
  return resolveResultbyField('amphoe', searchStr, maxResult, lang)
}
const searchAddressByProvince = (searchStr, maxResult, lang) => {
  return resolveResultbyField('province', searchStr, maxResult, lang)
}
const searchAddressByZipcode = (searchStr, maxResult, lang) => {
  return resolveResultbyField('zipcode', searchStr, maxResult, lang)
}

const splitAddress = (fullAddress) => {
  let regex = /\s(\d{5})(\s|$)/gi
  let regexResult = regex.exec(fullAddress)
  if (!regexResult) {
    return null
  }
  let zip = regexResult[1]
  let address = utilAddress.prepareAddress(fullAddress, zip)
  let result = utilAddress.getBestResult(zip, address)
  if (result) {
    let newAddress = utilAddress.cleanupAddress(address, result)
    return {
      address: newAddress,
      district: result.district,
      amphoe: result.amphoe,
      province: result.province,
      zipcode: zip
    }
  }
  return null
}

exports.searchAddressByDistrict = searchAddressByDistrict
exports.searchAddressByAmphoe = searchAddressByAmphoe
exports.searchAddressByProvince = searchAddressByProvince
exports.searchAddressByZipcode = searchAddressByZipcode
exports.splitAddress = splitAddress
