/**
 * NativeScript Polyfills
 */

// Install @nativescript/core polyfills (XHR, setTimeout, requestAnimationFrame)
import '@nativescript/core/globals';
// WebSockets polyfills
import '@valor/nativescript-websockets';
// Install @nativescript/angular specific polyfills
import '@nativescript/angular/polyfills';

/**
 * Zone.js and patches
 */
// Add pre-zone.js patches needed for the NativeScript platform
import '@nativescript/zone-js/dist/pre-zone-polyfills';

// Zone JS is required by default for Angular itself
import 'zone.js';

import './zone-disable';

import 'zone.js/plugins/zone-patch-rxjs';

// Add NativeScript specific Zone JS patches
import '@nativescript/zone-js';
