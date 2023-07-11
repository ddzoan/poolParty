import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import twilio from 'twilio';

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;

// twilio creds
const accountSid = '';
const authToken = '';
const senderNumber = '';

// for twilio dev accounts, need to add number to Verified Caller IDs
// https://console.twilio.com/us1/develop/phone-numbers/manage/verified?x-target-region=us1
const verifiedRecipient = '';

const client = new twilio(accountSid, authToken);
const sendText = (number, message) => {
  console.log('sending text message:', message);
  client.messages.create({
    to: number,
    from: senderNumber,
    body: message,
  })
    .then(message => console.log(`Message SID ${message.sid}`))
    .catch(error => console.error(error));
};

let oldString = '';

const checkForQueryIdChange = async (site, query, interval) => {
  try {
    console.log('time is', new Date().toLocaleString());
    const response = await fetch(site);
    const body = await response.text();

    const root = parse(body);
    const querySelector = root.querySelector(query);

    if(oldString === '') {
      oldString = querySelector.toString();
      console.log('setting initial string to', oldString);
      setTimeout(checkForQueryIdChange.bind(null, site, query, interval), interval);
    } else {
      console.log('comparing oldstring to querySelector string');
      if(oldString === querySelector.toString()) {
        console.log(`string is same, website probably did not change, checking again in ${interval/ONE_MINUTE} min`);
        setTimeout(checkForQueryIdChange.bind(null, site, query, interval), interval);
      } else {
        console.log('website changed, you should check it, script ending');
        sendText(verifiedRecipient, 'Check the pool class website');
      }
    }
  } catch (error) {
    console.log(error)
  }

};

const site = 'http://aquasportsswimacademy.com/pricing/';
const query = '#main';
const interval = 1 * ONE_MINUTE;

checkForQueryIdChange(site, query, interval);