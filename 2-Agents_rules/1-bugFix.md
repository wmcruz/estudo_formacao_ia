Corrija esse bugFix

core.mjs:29869 Angular is running in development mode.
core.mjs:29869 Angular hydrated 106 component(s) and 1093 node(s), 0 component(s) were skipped. Learn more at https://angular.io/guide/hydration.
core.mjs:6531 ERROR TypeError: this.postId(...).trim is not a function
    at _PostSearchBarComponent.onSearchSubmit (post-search-bar.component.ts:16:39)
    at PostSearchBarComponent_Template_form_submit_0_listener (post-search-bar.component.html:1:37)
    at executeListenerWithErrorHandling (core.mjs:25638:16)
    at wrapListenerIn_markDirtyAndPreventDefault (core.mjs:25678:22)
    at HTMLFormElement.<anonymous> (platform-browser.mjs:749:112)
    at _ZoneDelegate.invokeTask (zone.js:402:33)
    at core.mjs:14556:55
    at AsyncStackTaggingZoneSpec.onInvokeTask (core.mjs:14556:36)
    at _ZoneDelegate.invokeTask (zone.js:401:38)
    at Object.onInvokeTask (core.mjs:14869:33)
handleError @ core.mjs:6531
handleError @ core.mjs:12372
executeListenerWithErrorHandling @ core.mjs:25641
wrapListenerIn_markDirtyAndPreventDefault @ core.mjs:25678
(anônimo) @ platform-browser.mjs:749
invokeTask @ zone.js:402
(anônimo) @ core.mjs:14556
onInvokeTask @ core.mjs:14556
invokeTask @ zone.js:401
(anônimo) @ core.mjs:14869
invokeTask @ zone.js:401
runTask @ zone.js:159
invokeTask @ zone.js:483
(anônimo) @ zone.js:1138
globalCallback @ zone.js:1169
(anônimo) @ zone.js:1202
