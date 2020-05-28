const fs = require('fs')
// const excelToJson = require('convert-excel-to-json')
const csv = require('csv-parser')

let result
console.log('Converting csv to JSON...')
result = []
fs.createReadStream('database/raw_database/database.csv')
  .pipe(csv())
  .on('data', (data) => {
    result.push({
      province: data.province_en,
      amphoe: data.amphoe_en,
      district: data.district_en,
      zipcode: data.zipcode,
      province_th: data.province,
      amphoe_th: data.amphoe,
      district_th: data.district
    })
  })
  .on('end', () => {
    console.log
    process(result)
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

const process = (result) => {
  console.log('Converting ---- done !')
  fs.writeFile(
    './database/th.json',
    JSON.stringify(
      result.reduce(
        (
          acc,
          { province, province_th, amphoe, amphoe_th, district, district_th },
          index
        ) => {
          const obj = {}

          if (index === 1) return {}

          if (!acc[province]) {
            obj[province] = province_th
          }

          if (!acc[amphoe]) {
            obj[amphoe] = amphoe_th
          }

          if (!acc[district_th]) {
            obj[district_th] = district_th
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
    () => {
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
          exec('node ./database/migrate/buildTree.js', function (
            err,
            stdout,
            stderr
          ) {
            if (err) {
              console.log(err)
              return
            }
            console.log('Build json tree ---- done !')
            exec('node ./database/migrate/convert.js', function (
              err,
              stdout,
              stderr
            ) {
              if (err) {
                console.log(err)
                return
              }

              fs.unlinkSync('./database/migrate/tree.json')
              fs.unlinkSync('./database/migrate/database.json')
              console.log('Minify tree ---- done !')
              console.log('All task completed and ready to go !!')
            })
          })
        }
      )
    }
  )
}
