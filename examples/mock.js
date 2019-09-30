module.exports = {
    prefix: '/api', // So, the full request url will be `http://localhost:9000/api/test`
    delay: 800,
    apis: [
        // 1. Plain
        {
            url: '/plain',
            template: {
                msg: 'ok'
            }
        },
        // 2. Mocks code in mockjs tempalte syntax
        {
            url: '/random-code',
            template: {
                code: '@integer(1,10)',
                msg: 'ok'
            }
        },
        // 3. Tempalte can also be a function
        {
            url: '/timestamp',
            template: (mock) => {
                const now = new Date()
                return mock({  // `mock` == `Mock.mock`
                    code: '@integer(1,10)',
                    msg: 'ok',
                    data: now.valueOf(),
                })
            }
        },
        // 4. Uses `Promise` in the template
        {
            url: '/we-need-3s',
            template: () => {
                return new Promise((res) => {
                    setTimeout(() => {
                        res({ msg: 'ok' })
                    }, 3000)
                })
            }
        },
        // 5. Storing
        {
            url: '/user',
            method: 'post',
            template: (_, { state, request }) => {
                const u = request.body
                if (!state.users) {
                    state.users = {}
                }
                state.users[u.name] = u
                return { msg: 'ok' }
            }
        },
        // 6. Gets from the store
        {
            url: '/user/:name',
            method: 'get',
            template: (_, { state, request }) => {
                const userName = request.params.name
                return { msg: 'ok', data: state.users[userName] }
            }
        },
        // 7. Sends the other content-type data with response
        {
            url: '/plain-text',
            template: (_, { response }) => {
                response.send('ok') // or any you want to send
            }
        },
        // 8. Uses Mock
        {
            url: '/random-email',
            template: (_, { Mock }) => {
                const email = Mock.Random.email()
                return { msg: 'ok', data: email }
            }
        },
    ]
}
