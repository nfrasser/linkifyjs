import { registerPlugin, registerTokenPlugin } from 'linkifyjs';
import { keyword, tokens, registerKeywords } from './keyword';

registerTokenPlugin('keyword', tokens);
registerPlugin('keyword', keyword);

export default registerKeywords;
