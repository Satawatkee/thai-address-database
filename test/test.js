'use strict'

let mocha = require('mocha')
let describe = mocha.describe
let it = mocha.it
let expect = require('chai').expect
let db = require('../src')

describe('More than 1 zipcode District', function () {
  it('District Pran Buri have 2 result', function () {
    let result = db.searchAddressByDistrict('Pran Buri')
    expect(result.length).to.equal(2)
    expect(
      result.filter((item) => item.province === 'Prachuap Khiri Khan').length
    ).to.equal(2)
  })
  it('District Wang Phong have 2 result', function () {
    let result = db.searchAddressByDistrict('Wang Phong')
    expect(result.length).to.equal(2)
    expect(
      result.filter((item) => item.province === 'Prachuap Khiri Khan').length
    ).to.equal(2)
  })
  it('District Nong Ta Taem have 2 result', function () {
    let result = db.searchAddressByDistrict('Nong Ta Taem')
    expect(result.length).to.equal(2)
    expect(
      result.filter((item) => item.province === 'Prachuap Khiri Khan').length
    ).to.equal(2)
  })
  it('District Khao Chao have 2 result', function () {
    let result = db.searchAddressByDistrict('Khao Chao')
    expect(result.length).to.equal(2)
    expect(
      result.filter((item) => item.province === 'Prachuap Khiri Khan').length
    ).to.equal(2)
  })
  it('District Sam Roi Yot have 2 result', function () {
    let result = db.searchAddressByDistrict('Sam Roi Yot')
    expect(result.length).to.equal(2)
    expect(
      result.filter((item) => item.province === 'Prachuap Khiri Khan').length
    ).to.equal(2)
  })
  it('District Khao Noi have 2 result', function () {
    let result = db.searchAddressByDistrict('Khao Noi')
    expect(
      result.filter((item) => item.province === 'Prachuap Khiri Khan').length
    ).to.equal(2)
  })
})

describe('#search', function () {
  it('searchAddressByDistrict', function () {
    let result = db.searchAddressByDistrict('Aranyaprathet')
    expect(result.length).to.equal(1)

    result = db.searchAddressByDistrict(' Aranyaprathet')
    expect(result.length).to.equal(1)

    result = db.searchAddressByDistrict('Aranyaprathet ')
    expect(result.length).to.equal(1)

    result = db.searchAddressByDistrict('  Aranyaprathet  ')
    expect(result.length).to.equal(1)

    result = db.searchAddressByDistrict('')
    expect(result.length).to.equal(0)

    result = db.searchAddressByDistrict('  ')
    expect(result.length).to.equal(0)
  })

  it('searchAddressByAmphoe', function () {
    let result = db.searchAddressByAmphoe('Aranyaprathet')
    expect(result.length).to.equal(13)

    result = db.searchAddressByAmphoe('')
    expect(result.length).to.equal(0)
  })

  it('searchAddressByProvince', function () {
    let result = db.searchAddressByProvince('Sa Kaeo')
    expect(result.length).to.equal(20)

    result = db.searchAddressByProvince('Sa Kaeo', 10)
    expect(result.length).to.equal(10)

    result = db.searchAddressByProvince('Aranyaprathet')
    expect(result.length).to.equal(0)

    result = db.searchAddressByProvince('')
    expect(result.length).to.equal(0)
  })

  it('searchAddressByZipcode', function () {
    let result = db.searchAddressByZipcode('27120')
    expect(result.length).to.equal(15)

    result = db.searchAddressByZipcode(27120)
    expect(result.length).to.equal(15)

    result = db.searchAddressByZipcode(27120, 5)
    expect(result.length).to.equal(5)

    result = db.searchAddressByZipcode('')
    expect(result.length).to.equal(0)
  })
})

describe('Function splitAddress', function () {
  it('Shoud split address without touching original address', function () {
    let addr = `126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์ Pak Kret Pak Kret Nonthaburi Thailand 11120`
    let result = db.splitAddress(addr)
    expect(result).to.deep.equal({
      address: '126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์',
      amphoe: 'Pak Kret',
      district: 'Pak Kret',
      province: 'Nonthaburi',
      zipcode: '11120'
    })

    expect(addr).to.equal(
      `126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์ Pak Kret Pak Kret Nonthaburi Thailand 11120`
    )
  })

  it('Shoud return null when cant split address', function () {
    let addr = `126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์`
    let result = db.splitAddress(addr)
    expect(result).to.be.null

    expect(addr).to.equal(`126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์`)
  })

  it('Shoud return null when cant split address', function () {
    let addr = `126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์ ปากเกร็ด ปากเกร็ด Thailand 11120`
    let result = db.splitAddress(addr)
    expect(result).to.be.null

    expect(addr).to.equal(
      `126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์ ปากเกร็ด ปากเกร็ด Thailand 11120`
    )
  })

  it('Shoud return null when cant split address', function () {
    let addr = `126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์ Thailand 11120`
    let result = db.splitAddress(addr)
    console.log(result)
    expect(result).to.be.null

    expect(addr).to.equal(
      `126/548 ถ.สุขาประชาสรรค์ ม.การเคหะนนท์ Thailand 11120`
    )
  })
})
