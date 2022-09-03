import preval from 'preval.macro';

// export const buildAppVersion: { v: string } = preval`module.exports = require('../../public/version.json');`;
export const buildAppVersion: { v: string } = preval`module.exports = { v: require('../../package.json').version };`;
export const buildTimestamp: number = preval`module.exports = Date.now();`;

export default buildAppVersion;
