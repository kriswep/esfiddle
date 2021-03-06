/**
 * esfiddle's sandboxed iframe script processor
 */

import MicroEvent from './microevent';
import MESSAGES from './keys';

const $bus = new MicroEvent();

const urlParser = (url) => {
  const a = document.createElement('a');
  a.href = url;
  return a;
};

const ALLOWED_TYPES = Object.keys(MESSAGES).map(key => MESSAGES[key]);

// adding event listener to the iframe
window.addEventListener('message', (event) => {
  // verify event's origin
  if (urlParser(window.location.href).origin !== event.origin) {
    return;
  }

  const data = event.data;
  const type = data.type;

  // type exists and must be one of allowed types
  if (!type || !Boolean(~ALLOWED_TYPES.indexOf(type))) {  // eslint-disable-line
    return;
  }

  // else trigger an event of 'type'
  $bus.trigger(type, data.data);
});

// notify the parent window that we have loaded successfully
window.onload = () => window.parent && window.parent.postMessage({ LOADED: true }, "*");   // eslint-disable-line

// listen (and react to) events on $bus

// RUN_SCRIPT EVENT
/* global babel */
$bus.on(MESSAGES.RUN_SCRIPT, (code) => {
  document.body.innerHTML = ''; // reset logs
  babel.run(`try { ${code} } catch (e) { console.error(e) }`);
});

// UPDATE_VIEW EVENT
const STYLE_EL = document.createElement('style');
STYLE_EL.id = 'esfiddle-result-styles';
document.head.appendChild(STYLE_EL);
$bus.on(MESSAGES.UPDATE_VIEW, ({ textColor, borderColor }) => {
  STYLE_EL.innerHTML = `body{font-family:monospace;padding:10px;color:${textColor} !important; transition:color 0.5s;}
           div{border-bottom:1px solid ${borderColor};padding: 2px 0; transition:bottom-border 0.5s;}`;
});
