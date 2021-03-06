const easyVK = require('../index.js')


/*
 * 
 * This test shows you how you can chaing all calls
 * So, look at it
 * If all worked, it will send message for user with id 356607530 
 *
 */

const currentSessionFile = `${__dirname}/.vksession`

easyVK({
	api_v: '5.73',
	save_session: false,
	session_file: currentSessionFile,

	//Access token whcch you need get from your group settings
	access_token: '{TOKEN_FIELD}',
}).then((vk) => {


	//Get 2 users - me and 1
	return vk.call('users.get', {
		user_ids: [1, 356607530]
	})

}).then(({vkr, vk}) => {

	//Get my id not from cariable
	//Get it only from response
	const me = vkr.response[1].id



	//Log response
	console.log('[Users] - ', vkr.response)


	return vk.call('messages.send', {
		user_id: me,
		message: 'Hi! Test it!'
	})

}).then(({vkr: messageSendedResponse, vk}) => {
	
	console.log(messageSendedResponse)

}).catch(console.error)


//Handler all rejects and errors
process.on('unhandledRejection', console.error)