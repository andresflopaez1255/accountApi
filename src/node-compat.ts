/*
 * `buffer-equal-constant-time`, used transitively by Firebase Admin, still
 * expects SlowBuffer. Node 26 removed it. Keep this tiny shim until that
 * dependency chain ships native Node 26 support.
 */
const nativeBuffer = require('buffer') as typeof import('buffer') & { SlowBuffer?: typeof Buffer };

if (!nativeBuffer.SlowBuffer) {
	nativeBuffer.SlowBuffer = nativeBuffer.Buffer;
}
