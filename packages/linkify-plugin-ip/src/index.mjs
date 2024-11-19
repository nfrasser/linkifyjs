import { registerTokenPlugin, registerPlugin } from 'linkifyjs';
import { ipv4Tokens, ipv6Tokens, ip } from './ip';

registerTokenPlugin('ipv4', ipv4Tokens);
registerTokenPlugin('ipv6', ipv6Tokens);
registerPlugin('ip', ip);
