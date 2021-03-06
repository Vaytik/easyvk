

/**
 *   In this file are widgets for EasyVK
 *   You can use it
 *
 *   Author: @ciricc
 *   License: MIT
 *   
 */


"use strict";

const configuration = require("./configuration.js");
const staticMethods = require("./staticMethods.js");
const request = require("request");
const encoding = require("encoding");

class Widgets {
    
    //For call to methods an others, standard procedure
	constructor (vk) {
		let self = this;
		self._vk = vk;
	}

	async getLiveViews (video_source_id="") {
		let self = this;
		
		return new Promise((resolve, reject) => {

			if (!video_source_id || !staticMethods.isString(video_source_id)) {
				return reject(new Error("video_source_id must be like -2222_222222222 (String only)"));
			} 

			let headers, alVideoUrl, video, oid, vid, queryParams;


			headers = {
				"user-agent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
				"content-type": "application/x-www-form-urlencoded",
			};

			alVideoUrl = `${configuration.PROTOCOL}://${configuration.BASE_DOMAIN}/al_video.php`;
			video = video_source_id.split('_');
			oid = video[0];
			vid = video[1];

			//Get specify hash for get permissions to watch
			queryParams = {
				url: alVideoUrl,
				headers: headers,
				body: `act=show&al=1&al_ad=0&autoplay=0&list=&module=videocat&video=${video_source_id}`,
			}

			request.post(queryParams, (err, res, vkr) => {
				
				if (err) {
					return reject(new Error(err));
				}
				self._vk.debugger.push("response", res.body);


				//Parsing hash from response body {"action_hash" : "hash"}
				let matCH = res.body.match(/(\"|\')action_hash(\"|\')(\s)?\:(\s)?(\'|\")(.*?)(\'|\")/i);
				if (matCH) {
					
					let hash, getVideoViewsQueryParams;

					hash = matCH[0].replace(/([\s\'\:\"])/g, "").replace("action_hash", "");
					
					getVideoViewsQueryParams = {
						url:  `${alVideoUrl}?act=live_heartbeat`,
						body: `al=1&hash=${hash}&oid=${oid}&user_id=0&vid=${vid}`,
						encoding: "binary", //Special
						headers: headers,
					}

					//Here is magic
					request.post(getVideoViewsQueryParams, (err, res) => {
						
						if (err) {
							return reject(new Error(err));
						}
						self._vk.debugger.push("response", res.body);

						let videoInfo = encoding.convert(res.body, "windows-1252");
						
						videoInfo = videoInfo.toString();
						
						if (videoInfo.match("<!int>")) {
							let countViews = videoInfo.match('<!int>([0-9]+)<!>');
							
							if (countViews) {
								countViews = parseInt(countViews[1]);
								return resolve(countViews);
							} else {
								return reject(new Error("Maybe VK video page was changed, we can\'t get a number of views from response"));
							}

						} else {
							return reject(new Error("Maybe VK video page was changed, we can\'t get a number of views from response"));
						}
					});

				} else {
					reject('The live video (' + video + ') is not streaming now!');
				}
			});
		});
	}
}

module.exports = Widgets;