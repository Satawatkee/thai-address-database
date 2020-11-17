function preprocess (_ref) {
  var data = _ref.data,
    lookup = _ref.lookup,
    words = _ref.words

  var expanded = []
  var useLookup = false
  var t = void 0

  if (lookup && words) {
    // compact with dictionary and lookup
    useLookup = true
    lookup = lookup.split('|')
    words = words.split('|')
  }

  t = function t (text) {
    function repl (m) {
      var ch = m.replace(/[{,}]/g, '').charCodeAt(0)

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
    var i = 1
    if (provinces.length === 3) {
      // geographic database
      i = 2
    }

    provinces[i].map(function (amphoes) {
      amphoes[i].map(function (districts) {
        districts[i] =
          districts[i] instanceof Array ? districts[i] : [districts[i]]
        districts[i].map(function (zipcode) {
          var entry = {
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

let db = []

export const setDB = (newDB) => {
  db = preprocess(newDB)
}

var resolveResultbyField = function resolveResultbyField (
  type,
  searchStr,
  maxResult
) {
  searchStr = searchStr.toString().trim()
  if (searchStr === '') {
    return []
  }
  if (!maxResult) {
    maxResult = 20
  }
  var possibles = []
  try {
    possibles = db
      .filter(function (item) {
        var regex = new RegExp(searchStr, 'ig')
        return (item[type] || '').toString().match(regex)
      })
      .slice(0, maxResult)
  } catch (e) {
    return []
  }
  return possibles
}

export var searchAddressByDistrict = function searchAddressByDistrict (
  searchStr,
  maxResult
) {
  return resolveResultbyField('district', searchStr, maxResult)
}
export var searchAddressByAmphoe = function searchAddressByAmphoe (
  searchStr,
  maxResult
) {
  return resolveResultbyField('amphoe', searchStr, maxResult)
}
export var searchAddressByProvince = function searchAddressByProvince (
  searchStr,
  maxResult
) {
  return resolveResultbyField('province', searchStr, maxResult)
}
export var searchAddressByZipcode = function searchAddressByZipcode (
  searchStr,
  maxResult
) {
  return resolveResultbyField('zipcode', searchStr, maxResult)
}
