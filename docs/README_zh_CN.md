# simple-mock-webpack-plugin

简单易用的本地mock服务，挂载于`webpack-dev-server`。

## Features

- 支持配置热更新
- 无需额外监听新的端口，省去跨域等配置
- 简约而不简单的API配置，轻松地mock出你需要的几乎所有类型的接口
- 支持服务端数据临时存储，可以模拟出数据读写的能力
- 使用`mockjs`实现的mocking，具体语法详见[nuysoft/Mock](https://github.com/nuysoft/Mock/wiki/Getting-Started)

> 注意：虽然叫做`simple-mock-webpack-plugin`，但就使用方法来说这并不是一个标准的`webpack-plugin` 😂

## 安装

Yarn
```shell
yarn add -D simple-mock-webpack-plugin
```

NPM
```shell
npm i -D simple-mock-webpack-plugin
```

## 快速使用

**1.** `webpack.config.js`中设置`devServer.before`

```javascript
const { buildBefore } = require('simple-mock-webpack-plugin')

module.exports = {
    devServer: {
        before: buildBefore()
    }
}
```

**2.** 在同级目录下新建配置文件`mock.js`

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

**3.** 在页面中试下效果

```javascript
const _fetch = url => fetch(url).then(resp => resp.json()).then(console.log)

_fetch('/test') // {code: 264, msg: "ok"}
_fetch('/count') // {data: 1}
_fetch('/count') // {data: 2}
```

## 参数

| 名称        	| 类型         	| 必要 	| 默认值      	| 描述                             	|
|-------------	|--------------	|------	|-------------	|----------------------------------	|
| configPath  	| `string`   	| 否   	| `./mock.js` 	| 配置文件位置                     	|
| log         	| `boolean`  	| 否   	| `true`      	| 是否输出log                      	|
| before      	| `Function` 	| 否   	| `null`      	| 自定义`before`                   	|
| reloadDelay 	| `number`   	| 否   	| `300`       	| 配置文件更改后延迟重载服务的时间 	|

示例

```javascript
module.exports = {
    devServer: {
        before: buildBefore({ configPath: path.resolve(__dirname, 'my_mock.js') })
    }
}
```

## 配置文件的数据结构

配置文件示例请参考[examples](https://github.com/zhang2333/simple-mock-webpack-plugin/blob/master/examples/mock.js)，以下为各类型的数据结构

- `MockConfig`

| 名称   	| 类型           | 必要   | 默认值 	| 描述                  	|
|--------	|------------   |------	|--------	|-----------------------	|
| prefix 	| `string`    	| 否   	| `/`    	| 所有接口的路由前缀     	|
| delay  	| `boolean`   	| 否   	| `0`    	| 所有接口的延迟返回时间 	|
| apis   	| `MockAPI[]` 	| 是   	|        	| 接口配置列表           	|

- `MockAPI`

| 名称       | 类型                           | 必要 | 默认值 	   | 描述                              |
|----------	|-----------------------------	|----- |--------	|--------------------------------- |
| url      	| `string`                  	| 是   	|        	| 接口相对`prefix`的地址，一般以`/`开头 |
| method   	| `string`                  	| 否   	| `all`  	| 接口`Method`，默认支持全部类型的`Method` |
| template 	| `object \| MockAPIHandler` 	| 是   	|        	| 接口描述，设置为`object`时视为`mockjs template`（详见[Syntax](https://github.com/nuysoft/Mock/wiki/Syntax-Specification)），设置为函数时可以自定义返回结果 |

- `MockAPIHandler`

```javascript
(mock: MockjsMock, options: ExtraOptions) => object|Promise<object>
```

- `ExtraOptions`

| 名称     	| 类型               	| 默认值 	| 描述                                                      	|
|----------	|--------------------	|--------	|-----------------------------------------------------------	|
| state    	| `object`           	| `{}`   	| 服务端存储的临时数据，重载服务并不会影响到此值            	|
| request  	| `Express.Request`  	|        	| [Express Request](https://expressjs.com/en/api.html#req)  	|
| response 	| `Express.Response` 	|        	| [Express Response](https://expressjs.com/en/api.html#res) 	|
| Mock     	| `Mock.Mockjs`      	|        	| 即`Mock = require('mockjs')`                              	|

## License

[MIT](https://github.com/zhang2333/simple-mock-webpack-plugin/blob/master/LICENSE)
