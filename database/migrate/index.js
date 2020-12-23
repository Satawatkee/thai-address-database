const language = process.env.LANG
const fs = require('fs')
// const excelToJson = require('convert-excel-to-json')
const csv = require('csv-parser')

let result
console.log('Converting csv to JSON...')
result = []
fs.createReadStream('database/raw_database/location_master.csv')
  .pipe(csv())
  .on('data', (data) => {
    if (language === 'en') {
      result.push({
        province: data.province_en.trim(),
        amphoe: data.district_en.trim(),
        district: data.sub_district_en.trim(),
        zipcode: data.postal_code.trim(),
        province_th: data.province.trim(),
        amphoe_th: data.district.trim(),
        district_th: data.sub_district.trim()
      })
    } else {
      result.push({
        province: data.province,
        amphoe: data.district,
        district: data.sub_district,
        zipcode: data.postal_code
      })
    }
  })
  .on('end', () => {
    processDatabase(result)
    if (language === 'en') {
      fs.writeFile(
        './database/th.json',
        JSON.stringify(
          result.reduce(
            (
              acc,
              {
                province,
                province_th: provinceTh,
                amphoe,
                amphoe_th: amphoeTh,
                district,
                district_th: districtTh
              },
              index
            ) => {
              const obj = {}

              if (index === 1) return {}

              if (!acc[province]) {
                obj[province] = provinceTh
              }
              const amphoeKey = `district.${amphoe}`
              if (!acc[amphoeKey]) {
                obj[amphoeKey] = amphoeTh
              }

              const districtKey = `subdistrict.${district}`
              if (!acc[districtKey]) {
                obj[districtKey] = districtTh
              }

              return {
                ...acc,
                ...obj
              }
            }
          ),
          {}
        ),
        'utf8',
        () => {}
      )
    }
  })
//   console.log('Converting excel to JSON...')
//   result = excelToJson({
//     sourceFile: './database/raw_database/database.xlsx',
//     header: {
//       rows: 1
//     },
//     columnToKey: {
//       A: 'province',
//       B: 'amphoe',
//       C: 'district',
//       D: 'zipcode'
//     }
//   }).Sheet1
//   process(result)

const processDatabase = (result) => {
  console.log('Converting ---- done !')
  fs.writeFile(
    './database/migrate/database.json',
    JSON.stringify(result),
    'utf8',
    function (err) {
      if (err) {
        console.log('error')
        console.log(err)
        return
      }

      let exec = require('child_process').exec
      exec(
        'node ./database/migrate/buildTree.js',
        function (err, stdout, stderr) {
          if (err) {
            console.log(err)
            return
          }
          console.log('Build json tree ---- done !')
          exec(
            'node ./database/migrate/convert.js',
            function (err, stdout, stderr) {
              if (err) {
                console.log(err)
                return
              }

              fs.unlinkSync('./database/migrate/tree.json')
              fs.unlinkSync('./database/migrate/database.json')
              console.log('Minify tree ---- done !')
              console.log('All task completed and ready to go !!')
            }
          )
        }
      )
    }
  )
}
