import * as http from 'http'
import * as request from 'request'
import * as path from 'path'
const DataLoader = require('dataloader')

export default class SWAPIConnector {
  public loader
  private hostname
  private port
  private rootURL: string

  constructor(hostname: string, port: string) {
    this.hostname = hostname
    this.port = port
    this.loader = new DataLoader((urls) => {
      const promises = urls.map((url) => {
        return this.fetch(url)
      })
      return Promise.all(promises)
    }, {batch: false})
  }

  public fetch(resource: string) {
    const baseUrl = `http://${this.hostname}:${this.port}/api`
    const url = resource.indexOf(this.hostname) == -1
        ? baseUrl + resource
        : resource.replace(`http://${this.hostname}/api`, baseUrl)
    console.log(url)

    return new Promise<any>((resolve, reject) => {
      const req = http.request(url, (res) => {
          if (res.statusCode < 200 || res.statusCode > 299) {
              reject(new Error(`Failed to fetch: ${url} statusCode: ${res.statusCode}`))
          }
          const body = []
          res.on('data', (chunk) => body.push(chunk))
          res.on('end', () => resolve( JSON.parse(body.join()) ))
      })
      req.on('error', (err) => reject(err))
      req.end()
    })
  }

  public fetchPage(resource: string, offset?: number, limit?: number) {
    let results = []
    let index = 0
    const size = limit || 0

    function pagination(pageURL: string) {
      return this.fetch(pageURL).then((data) => {
          // fast forward until offset is reached
          if (offset && results.length === 0) {
            if (index + data.results.length > offset) {
              results = data.results.slice(offset - index)
            }
            if (data.next) {
              index = index + data.results.length
              return pagination.call(this, data.next)
            } else {
              return results
            }
          } else {
            if (size > 0 && size - results.length - data.results.length < 0) {
              results = results.concat(data.results.slice(0, size - results.length))
            } else {
              results = results.concat(data.results)
            }
            if (data.next && (size === 0 || size - results.length > 0)) {
              return pagination.call(this, data.next)
            } else {
              return results
            }
          }
        })
    }

    return pagination.call(this, resource)
  }
}
