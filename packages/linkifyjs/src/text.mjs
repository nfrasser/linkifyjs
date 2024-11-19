/******************************************************************************
Text Tokens
Identifiers for token outputs from the regexp scanner
******************************************************************************/

// A valid web domain token
export const WORD = 'WORD'; // only contains a-z
export const UWORD = 'UWORD'; // contains letters other than a-z, used for IDN

// Special case of word
export const LOCALHOST = 'LOCALHOST';

// Valid top-level domain, special case of WORD (see tlds.js)
export const TLD = 'TLD';

// Valid IDN TLD, special case of UWORD (see tlds.js)
export const UTLD = 'UTLD';

// The scheme portion of a web URI protocol. Supported types include: `mailto`,
// `file`, and user-defined custom protocols. Limited to schemes that contain
// only letters
export const SCHEME = 'SCHEME';

// Similar to SCHEME, except makes distinction for schemes that must always be
// followed by `://`, not just `:`. Supported types include `http`, `https`,
// `ftp`, `ftps`
export const SLASH_SCHEME = 'SLASH_SCHEME';

// Any sequence of digits 0-9
export const NUM = 'NUM';

// Any number of consecutive whitespace characters that are not newline
export const WS = 'WS';

// New line (unix style)
export const NL = 'NL'; // \n

// Opening/closing bracket classes
// TODO: Rename OPEN -> LEFT and CLOSE -> RIGHT in v5 to fit with Unicode names
// Also rename angle brackes to LESSTHAN and GREATER THAN
export const OPENBRACE = 'OPENBRACE'; // {
export const CLOSEBRACE = 'CLOSEBRACE'; // }
export const OPENBRACKET = 'OPENBRACKET'; // [
export const CLOSEBRACKET = 'CLOSEBRACKET'; // ]
export const OPENPAREN = 'OPENPAREN'; // (
export const CLOSEPAREN = 'CLOSEPAREN'; // )
export const OPENANGLEBRACKET = 'OPENANGLEBRACKET'; // <
export const CLOSEANGLEBRACKET = 'CLOSEANGLEBRACKET'; // >
export const FULLWIDTHLEFTPAREN = 'FULLWIDTHLEFTPAREN'; // （
export const FULLWIDTHRIGHTPAREN = 'FULLWIDTHRIGHTPAREN'; // ）
export const LEFTCORNERBRACKET = 'LEFTCORNERBRACKET'; // 「
export const RIGHTCORNERBRACKET = 'RIGHTCORNERBRACKET'; // 」
export const LEFTWHITECORNERBRACKET = 'LEFTWHITECORNERBRACKET'; // 『
export const RIGHTWHITECORNERBRACKET = 'RIGHTWHITECORNERBRACKET'; // 』
export const FULLWIDTHLESSTHAN = 'FULLWIDTHLESSTHAN'; // ＜
export const FULLWIDTHGREATERTHAN = 'FULLWIDTHGREATERTHAN'; // ＞

// Various symbols
export const AMPERSAND = 'AMPERSAND'; // &
export const APOSTROPHE = 'APOSTROPHE'; // '
export const ASTERISK = 'ASTERISK'; // *
export const AT = 'AT'; // @
export const BACKSLASH = 'BACKSLASH'; // \
export const BACKTICK = 'BACKTICK'; // `
export const CARET = 'CARET'; // ^
export const COLON = 'COLON'; // :
export const COMMA = 'COMMA'; // ,
export const DOLLAR = 'DOLLAR'; // $
export const DOT = 'DOT'; // .
export const EQUALS = 'EQUALS'; // =
export const EXCLAMATION = 'EXCLAMATION'; // !
export const HYPHEN = 'HYPHEN'; // -
export const PERCENT = 'PERCENT'; // %
export const PIPE = 'PIPE'; // |
export const PLUS = 'PLUS'; // +
export const POUND = 'POUND'; // #
export const QUERY = 'QUERY'; // ?
export const QUOTE = 'QUOTE'; // "
export const FULLWIDTHMIDDLEDOT = 'FULLWIDTHMIDDLEDOT'; // ・

export const SEMI = 'SEMI'; // ;
export const SLASH = 'SLASH'; // /
export const TILDE = 'TILDE'; // ~
export const UNDERSCORE = 'UNDERSCORE'; // _

// Emoji symbol
export const EMOJI = 'EMOJI';

// Default token - anything that is not one of the above
export const SYM = 'SYM';
