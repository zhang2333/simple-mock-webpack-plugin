# simple-mock-webpack-plugin

[中文文档](https://github.com/zhang2333/simple-mock-webpack-plugin/blob/master/docs/README_zh_CN.md)

Binds a local service to your `webpack-dev-server` for mocking data.

## Features

- Config of mocking supports hot reloading
- No more new listening port, no more CORS
- Mocks APIs in a succinct and simple way
- Stores data in the service(in memory), like a database
- Uses `mockjs` to support data mocking, learn more about [nuysoft/Mock](https://github.com/nuysoft/Mock/wiki/Getting-Started)

> P.S.: This repo is called `simple-mock-webpack-plugin`, but it isn't a stantard `webpack-plugin` because of its usage. 😂

## Installation

Yarn
```shell
yarn add -D simple-mock-webpack-plugin
```

NPM
```shell
npm i -D simple-mock-webpack-plugin
```

## Getting Started

**1.** Sets `devServer.before` in `webpack.config.js`

```javascript
const { buildBefore } = require('simple-mock-webpack-plugin')

module.exports = {
    devServer: {
        before: buildBefore()
    }
}
```

**2.** Create a config file named `mock.js` in the same directory

```javascript
module.exports = {
    apis: [
        {
            url: '/test',
            template: {
                code: '@integer(100,600)',
                msg: 'ok'
            }
        },
        {
            url: '/test-promise',
            template: (mock) => {
                return new Promise((res) => {
                    setTimeout(() => {
                        res(mock({
                            code: '@integer(100,600)',
                            msg: 'ok'
                        }))
                    }, 3000)
                })
            }
        },
        {
            url: '/count',
            template(mock, { state, request, response, Mock }) {
                state.counter = (state.counter || 0) + 1
                return {
                    data: state.counter
                }
            }
        },
        {
            url: '/get-count-number',
            template(mock, { state, request, response, Mock }) {
                return {
                    count: state.counter || 0
                }
            }
        },
    ]
}
```

**3.** Have a try

```javascript
const _fetch = url => fetch(url).then(resp => resp.json()).then(console.log)

_fetch('/test') // {code: 264, msg: "ok"}
_fetch('/count') // {data: 1}
_fetch('/count') // {data: 2}
```

## Options

| Name        	| Type         	| Required 	| Default      	| Description                             	|
|-------------	|--------------	|------	    |-------------	|---------------------------------------	|
| configPath  	| `string`   	| No   	    | `./mock.js` 	| The path of config file                   |
| log         	| `boolean`  	| No   	    | `true`      	| Whether prints logs                      	|
| before      	| `Function` 	| No   	    | `null`      	| Customized `before`                   	|
| reloadDelay 	| `number`   	| No   	    | `300`       	| Dealy of service's reloading          	|

Example

```javascript
module.exports = {
    devServer: {
        before: buildBefore({ configPath: path.resolve(__dirname, 'my_mock.js') })
    }
}
```

## Configuration of Mocking

Learn more about the configuration at [examples](https://github.com/zhang2333/simple-mock-webpack-plugin/blob/master/examples/mock.js).

- `MockConfig`

| Name   	| Type          	| Required 	| Default 	| Description                       	|
|--------	|---------------	|---------- |--------	|-----------------------------------	|
| prefix 	| `string`    	    | No   	    | `/`    	| The prefix of all APIs            	|
| delay  	| `boolean`   	    | No   	    | `0`    	| Dealy of the reponse for all APIs 	|
| apis   	| `MockAPI[]` 	    | Yes       |        	| The configuration of APIs           	|

- `MockAPI`

| Name     	| Type                        	| Required 	| Default 	| Description                   |
|----------	|-----------------------------	|--------	|--------	|------------------------------ |
| url      	| `string`                  	| Yes   	|        	| Path relative to the `prefix` |
| method   	| `string`                  	| No    	| `all`  	| The method of API |
| template 	| `object | MockAPIHandler` 	| Yes    	|        	| The tempalte of response. It will be regared as `mockjs template` if it is an `object`.（Learn more at [Syntax](https://github.com/nuysoft/Mock/wiki/Syntax-Specification)）. You can custmize reponse if you set it as a function. |

- `MockAPIHandler`

```javascript
(mock: MockjsMock, options: ExtraOptions) => object|Promise<object>
```

- `ExtraOptions`

| Name     	| Type               	| Default 	| Description                                                               	|
|----------	|--------------------	|--------	|-----------------------------------------------------------------------------	|
| state    	| `object`           	| `{}`   	| Temporary states in the service. It will not be affected from config changing	|
| request  	| `Express.Request`  	|        	| [Express Request](https://expressjs.com/en/api.html#req)                  	|
| response 	| `Express.Response` 	|        	| [Express Response](https://expressjs.com/en/api.html#res)                 	|
| Mock     	| `Mock.Mockjs`      	|        	| `Mock = require('mockjs')`                                                	|

## License

[MIT](https://github.com/zhang2333/simple-mock-webpack-plugin/blob/master/LICENSE)

