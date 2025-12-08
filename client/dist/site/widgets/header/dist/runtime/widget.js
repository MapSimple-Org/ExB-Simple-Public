System.register(["jimu-core","jimu-core/emotion","jimu-theme","jimu-ui","jimu-ui/advanced/site-components"],function(M,e){var N={},i={},t={},D={},s={};return{setters:[function(M){N.React=M.React,N.appActions=M.appActions,N.classNames=M.classNames,N.css=M.css,N.focusElementInKeyboardMode=M.focusElementInKeyboardMode,N.getAppStore=M.getAppStore,N.i18n=M.i18n,N.jimuHistory=M.jimuHistory,N.moduleLoader=M.moduleLoader,N.polished=M.polished,N.portalUrlUtils=M.portalUrlUtils,N.portalUtils=M.portalUtils,N.privilegeUtils=M.privilegeUtils,N.utils=M.utils},function(M){i.jsx=M.jsx,i.jsxs=M.jsxs},function(M){t.utils=M.utils},function(M){D.Button=M.Button,D.Dropdown=M.Dropdown,D.DropdownButton=M.DropdownButton,D.DropdownItem=M.DropdownItem,D.DropdownMenu=M.DropdownMenu,D.Icon=M.Icon,D.Link=M.Link,D.Nav=M.Nav,D.NavItem=M.NavItem,D.NavLink=M.NavLink,D.Navbar=M.Navbar,D.Popper=M.Popper,D.UserProfile=M.UserProfile,D.defaultMessages=M.defaultMessages},function(M){s.ExpressModeSwitch=M.ExpressModeSwitch}],execute:function(){M((()=>{var M={17:M=>{M.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2IiBmaWxsPSJub25lIj4NCjxwYXRoIGQ9Ik04LjAwMDA4IDEuNjY2NzVDNS40NjAwOCAxLjY2Njc1IDMuNjY2NzUgMy40OTU0MSAzLjY2Njc1IDUuNzQ2MDhDMy42NjY3NSA2Ljc3MDA4IDQuMDg4MDggNy40NjA3NSA0LjYxNjc1IDguMTE5NDFDNC43MzE0MSA4LjI2Mjc1IDQuODQ4MDggOC40MDA3NSA0Ljk2ODA4IDguNTQyNzVMNS4wMzIwOCA4LjYxNzQxQzUuMTcyMDggOC43ODQwOCA1LjMxNjc1IDguOTU2MDggNS40NTIwOCA5LjEzMzQxQzUuNzIxNDIgOS40ODc0MSA1Ljk3NDA4IDkuODg1NDEgNi4xMTU0MiAxMC4zNTYxQzYuMTUwMDMgMTAuNDgyIDYuMTM0MDQgMTAuNjE2NCA2LjA3MDg4IDEwLjczMDZDNi4wMDc3MSAxMC44NDQ5IDUuOTAyMzYgMTAuOTI5OSA1Ljc3NzM1IDEwLjk2NzVDNS42NTIzNCAxMS4wMDUxIDUuNTE3NTkgMTAuOTkyMyA1LjQwMTg3IDEwLjkzMTlDNS4yODYxNSAxMC44NzE0IDUuMTk4NjYgMTAuNzY4MiA1LjE1ODA4IDEwLjY0NDFDNS4wNjYwOCAxMC4zMzc0IDQuODkzNDEgMTAuMDUwNyA0LjY1NjA4IDkuNzM5NDFDNC41MzA4MyA5LjU3NzQ2IDQuNDAxNDUgOS40MTg3NSA0LjI2ODA4IDkuMjYzNDFMNC4yMDY3NSA5LjE5MDA4QzQuMDg2NzUgOS4wNDg3NSAzLjk2MDA4IDguODk5NDEgMy44MzY3NSA4Ljc0NTQxQzMuMjQ2NzUgOC4wMTA3NSAyLjY2Njc1IDcuMTAwNzUgMi42NjY3NSA1Ljc0NTQxQzIuNjY2NzUgMi45MDg3NSA0Ljk0MzQxIDAuNjY2NzQ4IDguMDAwMDggMC42NjY3NDhDMTEuMDU2NyAwLjY2Njc0OCAxMy4zMzM0IDIuOTA4MDggMTMuMzMzNCA1Ljc0NjA4QzEzLjMzMzQgNy4xMDA3NSAxMi43NTM0IDguMDEwNzUgMTIuMTYzNCA4Ljc0NjA4QzEyLjA0MDEgOC44OTk0MSAxMS45MTM0IDkuMDQ4NzUgMTEuNzkzNCA5LjE5MDc1TDExLjczMjEgOS4yNjM0MUMxMS41OTIxIDkuNDI4NzUgMTEuNDYyMSA5LjU4NDA4IDExLjM0NDEgOS43Mzk0MUMxMS4xMDY3IDEwLjA1MDcgMTAuOTM0MSAxMC4zMzgxIDEwLjg0MjEgMTAuNjQ0MUMxMC43OTk1IDEwLjc2NTggMTAuNzExNyAxMC44NjY0IDEwLjU5NjggMTAuOTI1QzEwLjQ4MTkgMTAuOTgzNSAxMC4zNDg4IDEwLjk5NTUgMTAuMjI1MyAxMC45NTgzQzEwLjEwMTggMTAuOTIxMiA5Ljk5NzQyIDEwLjgzNzkgOS45MzM4NSAxMC43MjU3QzkuODcwMjggMTAuNjEzNSA5Ljg1MjQ1IDEwLjQ4MTEgOS44ODQwOCAxMC4zNTYxQzEwLjAyNjEgOS44ODU0MSAxMC4yNzg3IDkuNDg3NDEgMTAuNTQ4NyA5LjEzMzQxQzEwLjY4MzQgOC45NTYwOCAxMC44MjgxIDguNzg0MDggMTAuOTY4NyA4LjYxNzQxTDExLjAzMjEgOC41NDI3NUMxMS4xNTIxIDguNDAwNzUgMTEuMjY4NyA4LjI2Mjc1IDExLjM4MzQgOC4xMjAwOEMxMS45MTIxIDcuNDYwMDggMTIuMzMzNCA2Ljc3MDA4IDEyLjMzMzQgNS43NDYwOEMxMi4zMzM0IDMuNDk1NDEgMTAuNTQwMSAxLjY2Njc1IDguMDAwMDggMS42NjY3NVpNNS44MzM0MSAxMi4wMDAxSDEwLjE2NjdDMTAuMjk5NCAxMi4wMDAxIDEwLjQyNjUgMTIuMDUyOCAxMC41MjAzIDEyLjE0NjVDMTAuNjE0MSAxMi4yNDAzIDEwLjY2NjcgMTIuMzY3NSAxMC42NjY3IDEyLjUwMDFDMTAuNjY2NyAxMi42MzI3IDEwLjYxNDEgMTIuNzU5OSAxMC41MjAzIDEyLjg1MzZDMTAuNDI2NSAxMi45NDc0IDEwLjI5OTQgMTMuMDAwMSAxMC4xNjY3IDEzLjAwMDFINS44MzM0MUM1LjcwMDgxIDEzLjAwMDEgNS41NzM2MyAxMi45NDc0IDUuNDc5ODYgMTIuODUzNkM1LjM4NjA5IDEyLjc1OTkgNS4zMzM0MSAxMi42MzI3IDUuMzMzNDEgMTIuNTAwMUM1LjMzMzQxIDEyLjM2NzUgNS4zODYwOSAxMi4yNDAzIDUuNDc5ODYgMTIuMTQ2NUM1LjU3MzYzIDEyLjA1MjggNS43MDA4MSAxMi4wMDAxIDUuODMzNDEgMTIuMDAwMVpNNi4zMzM0MSAxNC41MDAxQzYuMzMzNDEgMTQuMzY3NSA2LjM4NjA5IDE0LjI0MDMgNi40Nzk4NiAxNC4xNDY1QzYuNTczNjMgMTQuMDUyOCA2LjcwMDgxIDE0LjAwMDEgNi44MzM0MiAxNC4wMDAxSDkuMTY2NzVDOS4yOTkzNiAxNC4wMDAxIDkuNDI2NTMgMTQuMDUyOCA5LjUyMDMgMTQuMTQ2NUM5LjYxNDA3IDE0LjI0MDMgOS42NjY3NSAxNC4zNjc1IDkuNjY2NzUgMTQuNTAwMUM5LjY2Njc1IDE0LjYzMjcgOS42MTQwNyAxNC43NTk5IDkuNTIwMyAxNC44NTM2QzkuNDI2NTMgMTQuOTQ3NCA5LjI5OTM2IDE1LjAwMDEgOS4xNjY3NSAxNS4wMDAxSDYuODMzNDJDNi43MDA4MSAxNS4wMDAxIDYuNTczNjMgMTQuOTQ3NCA2LjQ3OTg2IDE0Ljg1MzZDNi4zODYwOSAxNC43NTk5IDYuMzMzNDEgMTQuNjMyNyA2LjMzMzQxIDE0LjUwMDFaIiBmaWxsPSJ3aGl0ZSIvPg0KPC9zdmc+"},75:M=>{M.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="M1 7.5c0-.291.231-.527.516-.527h11.508L9.527 3.4a.535.535 0 0 1 0-.746.51.51 0 0 1 .73 0L15 7.5l-4.743 4.846a.51.51 0 0 1-.73 0 .535.535 0 0 1 0-.746l3.497-3.573H1.516A.52.52 0 0 1 1 7.5"></path></svg>'},149:M=>{M.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2IiBmaWxsPSJub25lIj4NCjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8zODVfMTE2KSI+DQo8cGF0aCBkPSJNNy41IDJDOC4xNjMwNCAyIDguNzk4OTMgMi4yNjMzOSA5LjI2Nzc3IDIuNzMyMjNDOS43MzY2MSAzLjIwMTA3IDEwIDMuODM2OTYgMTAgNC41QzEwIDUuMDIzIDkuODMzIDUuNDIzIDkuNTc3IDUuNzRDOS4zOTYzMSA1Ljk1NTMxIDkuMTg2MjUgNi4xNDQxNiA4Ljk1MyA2LjMwMUw4Ljc4NiA2LjQxOEM4LjUyNCA2LjYgOC4zMzUgNi43MzUgOC4yIDYuOTAxQzguMDYxNzUgNy4wNjg3OSA3Ljk5MDUxIDcuMjgxODEgOCA3LjQ5OVY4LjQ5OUM4IDguNjMxNjEgNy45NDczMiA4Ljc1ODc5IDcuODUzNTUgOC44NTI1NUM3Ljc1OTc5IDguOTQ2MzIgNy42MzI2MSA4Ljk5OSA3LjUgOC45OTlDNy4zNjczOSA4Ljk5OSA3LjI0MDIxIDguOTQ2MzIgNy4xNDY0NSA4Ljg1MjU1QzcuMDUyNjggOC43NTg3OSA3IDguNjMxNjEgNyA4LjQ5OVY3LjQ5OUM3IDYuOTggNy4xNjggNi41ODMgNy40MjUgNi4yNjlDNy42MSA2LjA0MyA3LjgzOCA1Ljg2NSA4LjA0MSA1LjcxOUw4LjIxNCA1LjU5OEM4LjQ3NCA1LjQxNyA4LjY2MyA1LjI4MSA4Ljc5OCA1LjExM0M4LjkzODgxIDQuOTQwNjcgOS4wMTA3NyA0LjcyMjI4IDkgNC41QzkgNC4xMDIxOCA4Ljg0MTk2IDMuNzIwNjQgOC41NjA2NiAzLjQzOTM0QzguMjc5MzYgMy4xNTgwNCA3Ljg5NzgyIDMgNy41IDNDNy4xMDIxOCAzIDYuNzIwNjQgMy4xNTgwNCA2LjQzOTM0IDMuNDM5MzRDNi4xNTgwNCAzLjcyMDY0IDYgNC4xMDIxOCA2IDQuNUM2IDQuNjMyNjEgNS45NDczMiA0Ljc1OTc5IDUuODUzNTUgNC44NTM1NUM1Ljc1OTc5IDQuOTQ3MzIgNS42MzI2MSA1IDUuNSA1QzUuMzY3MzkgNSA1LjI0MDIxIDQuOTQ3MzIgNS4xNDY0NSA0Ljg1MzU1QzUuMDUyNjggNC43NTk3OSA1IDQuNjMyNjEgNSA0LjVDNSAzLjgzNjk2IDUuMjYzMzkgMy4yMDEwNyA1LjczMjIzIDIuNzMyMjNDNi4yMDEwNyAyLjI2MzM5IDYuODM2OTYgMiA3LjUgMlpNNy41IDEwLjFDNy43MzIwNiAxMC4xIDcuOTU0NjIgMTAuMTkyMiA4LjExODcyIDEwLjM1NjNDOC4yODI4MSAxMC41MjA0IDguMzc1IDEwLjc0MjkgOC4zNzUgMTAuOTc1QzguMzc1IDExLjIwNzEgOC4yODI4MSAxMS40Mjk2IDguMTE4NzIgMTEuNTkzN0M3Ljk1NDYyIDExLjc1NzggNy43MzIwNiAxMS44NSA3LjUgMTEuODVDNy4yNjc5NCAxMS44NSA3LjA0NTM4IDExLjc1NzggNi44ODEyOCAxMS41OTM3QzYuNzE3MTkgMTEuNDI5NiA2LjYyNSAxMS4yMDcxIDYuNjI1IDEwLjk3NUM2LjYyNSAxMC43NDI5IDYuNzE3MTkgMTAuNTIwNCA2Ljg4MTI4IDEwLjM1NjNDNy4wNDUzOCAxMC4xOTIyIDcuMjY3OTQgMTAuMSA3LjUgMTAuMVoiIGZpbGw9IndoaXRlIi8+DQo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTcuNDk5OTkgMTRDOC42Nzk5OSAxNCA5LjY4OTk5IDEzLjg2MyAxMC41NSAxMy42MTFDMTEuNTUgMTQuMzEgMTIuODggMTUuMDMxIDE0LjYgMTUuODgxQzE1LjUxNiAxNi4zMzcgMTYuMzkgMTUuMzAzIDE1LjgxIDE0LjQ2MUMxNS4wODMgMTMuMzkxIDE0LjQ1IDEyLjM1MSAxMy45NSAxMS4xNzFDMTQuNjg2IDEwLjAwMSAxNC45OSA4LjU2MDk4IDE0Ljk5IDcuMDAwOThDMTQuOTkgMy4xMzA5OCAxMy4xMSAwLjAwMDk3NjU2MiA3LjQ4OTk5IDAuMDAwOTc2NTYyQzEuODY5OTkgMC4wMDA5NzY1NjIgLTAuMDEwMDA5OCAzLjE0MDk4IC0wLjAxMDAwOTggNy4wMDA5OEMtMC4wMTAwMDk4IDEwLjg3MSAxLjg2OTk5IDE0LjAwMSA3LjQ4OTk5IDE0LjAwMUw3LjQ5OTk5IDE0Wk0xMy4xMSAxMC42NEMxMy4wMjQyIDEwLjc3NTkgMTIuOTcyNCAxMC45MzA0IDEyLjk1OSAxMS4wOTA2QzEyLjk0NTYgMTEuMjUwNyAxMi45NzEgMTEuNDExNyAxMy4wMzMgMTEuNTZDMTMuNTQ5IDEyLjc5IDE0LjIwMyAxMy44NyAxNC45MjMgMTQuOTNDMTMuMjczIDE0LjEwNyAxMi4wNDMgMTMuNDMgMTEuMTIzIDEyLjc5QzExLjAwMDUgMTIuNzA0NSAxMC44NjAzIDEyLjY0NzUgMTAuNzEyOSAxMi42MjMzQzEwLjU2NTQgMTIuNTk5MSAxMC40MTQ0IDEyLjYwODIgMTAuMjcxIDEyLjY1QzkuNTEyOTkgMTIuODcxIDguNjAwOTkgMTIuOTk5IDcuNTAwOTkgMTIuOTk5QzQuODcwOTkgMTIuOTk5IDMuMzAwOTkgMTIuMjcxIDIuMzcwOTkgMTEuMjY5QzEuNDI5OTkgMTAuMjQ5IDAuOTk5OTkgOC43ODg5OCAwLjk5OTk5IDYuOTk4OThDMC45OTk5OSA1LjIwODk4IDEuNDMzOTkgMy43Mzg5OCAyLjM2OTk5IDIuNzI4OThDMy4yOTY5OSAxLjcyODk4IDQuODY5OTkgMC45OTg5NzcgNy40OTk5OSAwLjk5ODk3N0MxMC4xMyAwLjk5ODk3NyAxMS43IDEuNzI2OTggMTIuNjMgMi43Mjg5OEMxMy41NyAzLjc0ODk4IDE0IDUuMjA4OTggMTQgNi45OTg5OEMxNCA4LjQzODk4IDEzLjcxNiA5LjY3ODk4IDEzLjExMiAxMC42MzlMMTMuMTEgMTAuNjRaIiBmaWxsPSJ3aGl0ZSIvPg0KPC9nPg0KPGRlZnM+DQo8Y2xpcFBhdGggaWQ9ImNsaXAwXzM4NV8xMTYiPg0KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJ3aGl0ZSIvPg0KPC9jbGlwUGF0aD4NCjwvZGVmcz4NCjwvc3ZnPg=="},244:M=>{"use strict";M.exports=N},258:M=>{M.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2IiBmaWxsPSJub25lIj4NCjxwYXRoIGQ9Ik0xMi40NTE0IDQuNTQ5MTRMMTIuNjUyNSA0Ljc0NjI5QzE0LjIxNzIgNi4yODA1NyAxNSA3LjA0Njg2IDE1IDhDMTUgOC45NTMxNCAxNC4yMTcyIDkuNzIwMjkgMTIuNjUyNSAxMS4yNTM3TDEyLjQ1MTQgMTEuNDUwOU05LjY0MDM1IDJMNi4zNTk2NiAxNE0zLjU0Nzc2IDQuNTQ5MTRMMy4zNDY2IDQuNzQ2MjlDMS43ODI3OCA2LjI4MDU3IDEgNy4wNDY4NiAxIDhDMSA4Ljk1MzE0IDEuNzgyNzggOS43MjAyOSAzLjM0ODM1IDExLjI1MzdMMy41NDk1MSAxMS40NTA5IiBzdHJva2U9IndoaXRlIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4NCjwvc3ZnPg=="},284:M=>{M.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDE2IDEyIiBmaWxsPSJub25lIj4NCjxwYXRoIGQ9Ik0xMi4xNTcyIDYuNzQzMTFDMTIuMTI5NSA2LjY1MDUyIDEyLjEyODkgNi41NTE2NSAxMi4xNTU2IDYuNDU4NzRMMTMuMjc4NiAyLjUyODQ4QzEzLjI4NDggMi41MDc2NyAxMy4zMDM1IDIuNDkzNDIgMTMuMzI0OCAyLjQ5MzMzQzEzLjM0NiAyLjQ5MzI0IDEzLjM2NDkgMi41MDczMiAxMy4zNzEzIDIuNTI4MDdMMTUuOTk2NSAxMS4zOTMzQzE2LjAwMzkgMTEuNDE4MyAxNS45OTk0IDExLjQ0NTUgMTUuOTg0MSAxMS40NjY1QzE1Ljk2ODkgMTEuNDg3NSAxNS45NDQ5IDExLjUgMTUuOTE5MyAxMS41SDEzLjdDMTMuNjI5MiAxMS41IDEzLjU2NjggMTEuNDUyNyAxMy41NDYgMTEuMzgzNUwxMi4xNTcyIDYuNzQzMTFaTTguMDUwNDIgMTEuNUM4Ljc3NzE3IDExLjQ5OTkgOS40MTQwMiAxMS4wMDIgOS42MDU1NyAxMC4yODQzTDEyLjE4ODYgMC42MDQyOTdDMTIuMTk1MiAwLjU3OTUxIDEyLjE5MDEgMC41NTMwMTUgMTIuMTc0OSAwLjUzMjU4OUMxMi4xNTk3IDAuNTEyMTYzIDEyLjEzNjEgMC41MDAxMjIgMTIuMTExIDAuNUgxMC4yMTU2QzEwLjE0NDUgMC41IDEwLjA4MTggMC41NDc2MzEgMTAuMDYxMiAwLjYxNzMzNEw3Ljg0MjcgOC4xNDU0MUw2LjQ1NjI3IDIuOTI0ODlDNi40NTAzNSAyLjkwMzcxIDYuNDMxNTIgMi44ODkwNSA2LjQxMDAxIDIuODg4ODZDNi4zODg0OSAyLjg4ODY3IDYuMzY5NDIgMi45MDMgNi4zNjMxNSAyLjkyNDA3TDUuMjk0MjggNi42NTUxMUM1LjI2OTMgNi43NDIyMSA1LjI2ODIgNi44MzQ2NyA1LjI5MTEgNi45MjIzN0w2LjQ1NDY4IDExLjM3NzRDNi40NzM0MiAxMS40NDk2IDYuNTM3MjYgMTEuNSA2LjYxMDI3IDExLjVIOC4wNTA0MlpNMi4zNTU4OCAxMS41QzIuNDI4NTUgMTEuNSAyLjQ5MjI4IDExLjQ1MDMgMi41MTE0NyAxMS4zNzg2TDUuMzkwMTggMC42MDQyOTdDNS4zOTY3MyAwLjU3OTUxIDUuMzkxNjYgMC41NTMwMTUgNS4zNzY0NyAwLjUzMjU4OUM1LjM2MTI3IDAuNTEyMTYzIDUuMzM3NjYgMC41MDAxMjIgNS4zMTI1OCAwLjVIMy4zMDI5OEMzLjIzMTUgMC40OTk4NzkgMy4xNjg0OCAwLjU0Nzk3OCAzLjE0ODE4IDAuNjE4MTQ5TDAuMDAzMjUwNzUgMTEuMzk0MUMtMC4wMDM4NzU5MyAxMS40MTkgMC4wMDA4NTk3NDQgMTEuNDQ1OSAwLjAxNjAzNzggMTEuNDY2OEMwLjAzMTIxNTggMTEuNDg3NiAwLjA1NTA3MTMgMTEuNSAwLjA4MDQ1MTQgMTEuNUgyLjM1NTg4WiIgZmlsbD0id2hpdGUiLz4NCjwvc3ZnPg=="},321:M=>{"use strict";M.exports=D},386:M=>{"use strict";M.exports=i},545:M=>{"use strict";M.exports=s},550:M=>{M.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2IiBmaWxsPSJub25lIj4NCjxwYXRoIGQ9Ik0yLjU5OTYxIDEuNUgxMS40MDA0QzExLjY1NjcgMS41MDAwOSAxMS45MDMgMS41ODg4MiAxMi4wOTg2IDEuNzQ4MDVMMTIuMTc4NyAxLjgyMDMxQzEyLjM4NDYgMi4wMjQ3NCAxMi41IDIuMzAxMzMgMTIuNSAyLjU4ODg3VjYuNTU5NTdDMTIuNSA2LjgxMTA2IDEyLjQxMTggNy4wNTQyOSAxMi4yNTIgNy4yNDgwNUwxMi4xNzg3IDcuMzI4MTJDMTEuOTcyOCA3LjUzMjU2IDExLjY5MzEgNy42NDgzMyAxMS40MDA0IDcuNjQ4NDRIMy42NjYwMkwzLjUxOTUzIDcuNzkzOTVMMS41IDkuNzk4ODNWMi41ODg4N0MxLjUgMi4zMzczNiAxLjU4ODIgMi4wOTQxNiAxLjc0ODA1IDEuOTAwMzlMMS44MjEyOSAxLjgyMDMxQzIuMDI3MjEgMS42MTU5MSAyLjMwNjkgMS41MDAxIDIuNTk5NjEgMS41WiIgc3Ryb2tlPSJ3aGl0ZSIvPg0KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik01IDlWMTEuMDA0QzUgMTEuMzgzMiA1LjE1NDUyIDExLjc0NjggNS40Mjk1OCAxMi4wMTQ5QzUuNzA0NjMgMTIuMjgzIDYuMDc3NjggMTIuNDMzNyA2LjQ2NjY3IDEyLjQzMzdIMTMuMzY3M0wxNiAxNVY3LjQyOTcxQzE2IDcuMDUwNTIgMTUuODQ1NSA2LjY4Njg3IDE1LjU3MDQgNi40MTg3NUMxNS4yOTU0IDYuMTUwNjMgMTQuOTIyMyA2IDE0LjUzMzMgNkgxNFY3SDE0LjUzMzNDMTQuNjY1MiA3IDE0Ljc4NjcgNy4wNTEzMSAxNC44NzI0IDcuMTM0ODJDMTQuOTU3MiA3LjIxNzQ5IDE1IDcuMzI0MSAxNSA3LjQyOTcxVjEyLjYyODdMMTMuNzc0MSAxMS40MzM3SDYuNDY2NjdDNi4zMzQ3OCAxMS40MzM3IDYuMjEzMjggMTEuMzgyNCA2LjEyNzYgMTEuMjk4OUM2LjA0MjggMTEuMjE2MiA2IDExLjEwOTYgNiAxMS4wMDRWOUg1WiIgZmlsbD0id2hpdGUiLz4NCjwvc3ZnPg=="},561:M=>{M.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2IiBmaWxsPSJub25lIj4NCjxwYXRoIGQ9Ik0xMy41IDIuNUg4LjVWMS41QzguNSAxLjM2NzM5IDguNDQ3MzIgMS4yNDAyMSA4LjM1MzU1IDEuMTQ2NDVDOC4yNTk3OSAxLjA1MjY4IDguMTMyNjEgMSA4IDFDNy44NjczOSAxIDcuNzQwMjEgMS4wNTI2OCA3LjY0NjQ1IDEuMTQ2NDVDNy41NTI2OCAxLjI0MDIxIDcuNSAxLjM2NzM5IDcuNSAxLjVWMi41SDIuNUMyLjIzNDc4IDIuNSAxLjk4MDQzIDIuNjA1MzYgMS43OTI4OSAyLjc5Mjg5QzEuNjA1MzYgMi45ODA0MyAxLjUgMy4yMzQ3OCAxLjUgMy41VjExQzEuNSAxMS4yNjUyIDEuNjA1MzYgMTEuNTE5NiAxLjc5Mjg5IDExLjcwNzFDMS45ODA0MyAxMS44OTQ2IDIuMjM0NzggMTIgMi41IDEySDQuOTZMMy42MDkzOCAxMy42ODc1QzMuNTI2NDkgMTMuNzkxMSAzLjQ4ODE2IDEzLjkyMzQgMy41MDI4MiAxNC4wNTUyQzMuNTE3NDcgMTQuMTg3MSAzLjU4MzkgMTQuMzA3NyAzLjY4NzUgMTQuMzkwNkMzLjc5MTEgMTQuNDczNSAzLjkyMzM4IDE0LjUxMTggNC4wNTUyNCAxNC40OTcyQzQuMTg3MSAxNC40ODI1IDQuMzA3NzQgMTQuNDE2MSA0LjM5MDYyIDE0LjMxMjVMNi4yNCAxMkg5Ljc2TDExLjYwOTQgMTQuMzEyNUMxMS42NTA0IDE0LjM2MzggMTEuNzAxMiAxNC40MDY1IDExLjc1ODcgMTQuNDM4MkMxMS44MTYyIDE0LjQ2OTkgMTEuODc5NSAxNC40ODk5IDExLjk0NDggMTQuNDk3MkMxMi4wMSAxNC41MDQ0IDEyLjA3NjEgMTQuNDk4OCAxMi4xMzkyIDE0LjQ4MDVDMTIuMjAyMyAxNC40NjIyIDEyLjI2MTIgMTQuNDMxNyAxMi4zMTI1IDE0LjM5MDZDMTIuMzYzOCAxNC4zNDk2IDEyLjQwNjUgMTQuMjk4OCAxMi40MzgyIDE0LjI0MTNDMTIuNDY5OSAxNC4xODM4IDEyLjQ4OTkgMTQuMTIwNSAxMi40OTcyIDE0LjA1NTJDMTIuNTA0NCAxMy45OSAxMi40OTg4IDEzLjkyMzkgMTIuNDgwNSAxMy44NjA4QzEyLjQ2MjIgMTMuNzk3NyAxMi40MzE3IDEzLjczODggMTIuMzkwNiAxMy42ODc1TDExLjA0IDEySDEzLjVDMTMuNzY1MiAxMiAxNC4wMTk2IDExLjg5NDYgMTQuMjA3MSAxMS43MDcxQzE0LjM5NDYgMTEuNTE5NiAxNC41IDExLjI2NTIgMTQuNSAxMVYzLjVDMTQuNSAzLjIzNDc4IDE0LjM5NDYgMi45ODA0MyAxNC4yMDcxIDIuNzkyODlDMTQuMDE5NiAyLjYwNTM2IDEzLjc2NTIgMi41IDEzLjUgMi41Wk0xMy41IDExSDIuNVYzLjVIMTMuNVYxMVoiIGZpbGw9IndoaXRlIi8+DQo8L3N2Zz4="},622:M=>{M.exports="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjYiIGhlaWdodD0iMjYiIHZpZXdCb3g9IjAgMCAyNiAyNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF85NjlfMjY5MykiPg0KPHBhdGggZD0iTTI1LjkwODcgMTAuNjYwOUwyMy40MTg4IDE0LjkyNDJWMjEuNDE1NEMyMy40MTg4IDIxLjgxOTIgMjMuMjU1OSAyMi4yMDY1IDIyLjk2NTkgMjIuNDkyQzIyLjY3NiAyMi43Nzc2IDIyLjI4MjggMjIuOTM4IDIxLjg3MjcgMjIuOTM4SDIwLjgxNDlWNi4yNjkzNkMyMC44MTQ5IDYuMDk5MzMgMjAuNzQ2NCA1LjkzNjI2IDIwLjYyNDMgNS44MTYwM0MyMC41MDIyIDUuNjk1OCAyMC4zMzY2IDUuNjI4MjYgMjAuMTY0IDUuNjI4MjZIOS40MjMyMlYxLjA1NEM5LjQyMzAzIDEuMDExNTUgOS40MzQyNSAwLjk2OTgwNyA5LjQ1NTc0IDAuOTMzMDEyQzkuNDc3MjQgMC44OTYyMTcgOS41MDgyNSAwLjg2NTY4NCA5LjU0NTYxIDAuODQ0NTE3QzkuNTgyOTcgMC44MjMzNTEgOS42MjUzNiAwLjgxMjMwNSA5LjY2ODQ2IDAuODEyNTAzQzkuNzExNTcgMC44MTI3MDEgOS43NTM4NSAwLjgyNDEzNSA5Ljc5MTAxIDAuODQ1NjQ0TDEzLjY5NjcgMy4wNjM4NUgyMS44NzI3QzIyLjI4MjggMy4wNjM4NSAyMi42NzYgMy4yMjQyNyAyMi45NjU5IDMuNTA5ODJDMjMuMjU1OSAzLjc5NTM2IDIzLjQxODggNC4xODI2NSAyMy40MTg4IDQuNTg2NDdWOC40MTA2NEwyNS42Mzg1IDkuNjkyODRDMjUuODAzIDkuNzg3NDUgMjUuOTIzNCA5Ljk0MTcyIDI1Ljk3MzkgMTAuMTIyNkMyNi4wMjQ0IDEwLjMwMzYgMjYuMDAxIDEwLjQ5NjggMjUuOTA4NyAxMC42NjA5Wk05LjQyMzIyIDE1LjU2NTNIMTYuNTgzN1Y5Ljc5NTQySDkuNDIzMjJWMTUuNTY1M1pNMTYuMjU4MyAxOS43MzI1SDUuODQyOTdDNS42NzAzMiAxOS43MzI1IDUuNTA0NzUgMTkuNjY0OSA1LjM4MjY3IDE5LjU0NDdDNS4yNjA1OSAxOS40MjQ1IDUuMTkyMDEgMTkuMjYxNCA1LjE5MjAxIDE5LjA5MTRWMy4wNjM4NUg0LjEzNDIxQzMuNzI0MTggMy4wNjM4NSAzLjMzMDk0IDMuMjI0MjcgMy4wNDEwMSAzLjUwOTgyQzIuNzUxMDcgMy43OTUzNiAyLjU4ODE5IDQuMTgyNjUgMi41ODgxOSA0LjU4NjQ3VjExLjA3NzZMMC4wOTgyODY4IDE1LjM0MDlDMC4wNTAwMzYgMTUuNDIyOSAwLjAxODc0MiAxNS41MTM1IDAuMDA2MjA5ODQgMTUuNjA3NUMtMC4wMDYzMjIzMiAxNS43MDE0IDAuMDAwMTU1MjI3IDE1Ljc5NjkgMC4wMjUyNjg0IDE1Ljg4ODRDMC4wNTAzODE1IDE1Ljk3OTkgMC4wOTM2MzM1IDE2LjA2NTYgMC4xNTI1MzEgMTYuMTQwNUMwLjIxMTQyOSAxNi4yMTU0IDAuMjg0ODA2IDE2LjI3ODIgMC4zNjg0MzMgMTYuMzI1TDIuNTg4MTkgMTcuNTkxMlYyMS40MTU0QzIuNTg4MTkgMjEuODE5MiAyLjc1MTA3IDIyLjIwNjUgMy4wNDEwMSAyMi40OTJDMy4zMzA5NCAyMi43Nzc2IDMuNzI0MTggMjIuOTM4IDQuMTM0MjEgMjIuOTM4SDEyLjMxNjdMMTYuMjIyNCAyNS4xNTYyQzE2LjI1OTUgMjUuMTc2OSAxNi4zMDE1IDI1LjE4NzcgMTYuMzQ0MSAyNS4xODc1QzE2LjM4NjcgMjUuMTg3MyAxNi40Mjg1IDI1LjE3NjEgMTYuNDY1NCAyNS4xNTVDMTYuNTAyMyAyNS4xMzM5IDE2LjUzMjkgMjUuMTAzNyAxNi41NTQyIDI1LjA2NzRDMTYuNTc1NiAyNS4wMzEgMTYuNTg2OCAyNC45ODk4IDE2LjU4NyAyNC45NDc4VjIwLjA1M0MxNi41ODcgMjAuMDEwNyAxNi41Nzg1IDE5Ljk2ODcgMTYuNTYxOSAxOS45Mjk2QzE2LjU0NTMgMTkuODkwNSAxNi41MjExIDE5Ljg1NSAxNi40OTA1IDE5LjgyNTJDMTYuNDU5OSAxOS43OTU0IDE2LjQyMzcgMTkuNzcxOSAxNi4zODM4IDE5Ljc1NkMxNi4zNDM5IDE5Ljc0IDE2LjMwMTMgMTkuNzMyMSAxNi4yNTgzIDE5LjczMjVaIiBmaWxsPSIjMDlCOENBIi8+DQo8L2c+DQo8ZGVmcz4NCjxjbGlwUGF0aCBpZD0iY2xpcDBfOTY5XzI2OTMiPg0KPHJlY3Qgd2lkdGg9IjI2IiBoZWlnaHQ9IjI2IiBmaWxsPSJ3aGl0ZSIvPg0KPC9jbGlwUGF0aD4NCjwvZGVmcz4NCjwvc3ZnPg0K"},745:M=>{M.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" fill-rule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0m1 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-7.676 2.228H7.34c-.213-1.138.621-2.13 1.375-3.025C9.28 6.532 9.8 5.914 9.8 5.328 9.8 4.5 9.2 3.9 7.976 3.9c-.816 0-1.572.36-2.268 1.092l-.648-.6C5.852 3.552 6.788 3 8.096 3c1.692 0 2.772.864 2.772 2.244 0 .864-.652 1.628-1.3 2.387-.71.831-1.413 1.655-1.244 2.597m.3 2.172c0 .48-.348.792-.768.792-.432 0-.78-.312-.78-.792s.348-.804.78-.804c.42 0 .768.324.768.804" clip-rule="evenodd"></path></svg>'},754:M=>{M.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2IiBmaWxsPSJub25lIj4NCjxwYXRoIGQ9Ik0xMy40OTk5IDYuMzk5OUMxNC4wMDQ1IDYuNjkwNDQgMTQuNDEzNiA3LjEyMTUzIDE0LjY3NzQgNy42NDA1OEMxNC45NDExIDguMTU5NjMgMTUuMDQ4MiA4Ljc0NDIyIDE0Ljk4NTQgOS4zMjMwNkMxNC45MjI2IDkuOTAxODkgMTQuNjkyOCAxMC40NSAxNC4zMjM5IDEwLjkwMDRDMTMuOTU1IDExLjM1MDkgMTMuNDYzIDExLjY4NDMgMTIuOTA3OSAxMS44NTk5QzEyLjcxMTcgMTIuNzUwMiAxMi4yMTc0IDEzLjU0NjggMTEuNTA2NyAxNC4xMTc5QzEwLjc5NiAxNC42ODg5IDkuOTExNiAxNS4wMDAxIDguOTk5OTIgMTQuOTk5OUg3LjQ5OTkyQzcuMzY3MzEgMTQuOTk5OSA3LjI0MDE0IDE0Ljk0NzIgNy4xNDYzNyAxNC44NTM1QzcuMDUyNiAxNC43NTk3IDYuOTk5OTIgMTQuNjMyNSA2Ljk5OTkyIDE0LjQ5OTlDNi45OTk5MiAxNC4zNjczIDcuMDUyNiAxNC4yNDAxIDcuMTQ2MzcgMTQuMTQ2M0M3LjI0MDE0IDE0LjA1MjYgNy4zNjczMSAxMy45OTk5IDcuNDk5OTIgMTMuOTk5OUg4Ljk5OTkyQzkuNjIwNTQgMTQuMDAwMSAxMC4yMjYgMTMuODA3OSAxMC43MzI4IDEzLjQ0OTdDMTEuMjM5NiAxMy4wOTE1IDExLjYyMjkgMTIuNTg1IDExLjgyOTkgMTEuOTk5OUgxMS40OTk5QzExLjM2NzMgMTEuOTk5OSAxMS4yNDAxIDExLjk0NzIgMTEuMTQ2NCAxMS44NTM1QzExLjA1MjYgMTEuNzU5NyAxMC45OTk5IDExLjYzMjUgMTAuOTk5OSAxMS40OTk5VjYuNDk5OUMxMC45OTk5IDYuMzY3MjkgMTEuMDUyNiA2LjI0MDEyIDExLjE0NjQgNi4xNDYzNUMxMS4yNDAxIDYuMDUyNTggMTEuMzY3MyA1Ljk5OTkgMTEuNDk5OSA1Ljk5OTlIMTEuOTk5OUMxMi4xNjE5IDUuOTk5OSAxMi4zMjA5IDYuMDEyOSAxMi40NzY5IDYuMDM3OUMxMi4zNjQ0IDQuOTI4NzkgMTEuODQ0MSAzLjkwMDk1IDExLjAxNyAzLjE1MzUyQzEwLjE4OTggMi40MDYxIDkuMTE0NzMgMS45OTIyOSA3Ljk5OTkyIDEuOTkyMjlDNi44ODUxMiAxLjk5MjI5IDUuODEgMi40MDYxIDQuOTgyODcgMy4xNTM1MkM0LjE1NTc0IDMuOTAwOTUgMy42MzU0OSA0LjkyODc5IDMuNTIyOTIgNi4wMzc5QzMuNjgwNjcgNi4wMTI2MiAzLjg0MDE3IDUuOTk5OTEgMy45OTk5MiA1Ljk5OTlINC40OTk5MkM0LjYzMjUzIDUuOTk5OSA0Ljc1OTcxIDYuMDUyNTggNC44NTM0OCA2LjE0NjM1QzQuOTQ3MjQgNi4yNDAxMiA0Ljk5OTkyIDYuMzY3MjkgNC45OTk5MiA2LjQ5OTlWMTEuNDk5OUM0Ljk5OTkyIDExLjYzMjUgNC45NDcyNCAxMS43NTk3IDQuODUzNDggMTEuODUzNUM0Ljc1OTcxIDExLjk0NzIgNC42MzI1MyAxMS45OTk5IDQuNDk5OTIgMTEuOTk5OUgzLjk5OTkyQzMuMzM4OTEgMTIuMDAwNiAyLjY5NjE1IDExLjc4MyAyLjE3MTUyIDExLjM4MDlDMS42NDY4OSAxMC45Nzg4IDEuMjY5NzcgMTAuNDE0NiAxLjA5ODc0IDkuNzc2MTFDMC45Mjc3MSA5LjEzNzYgMC45NzIzNTMgOC40NjA0OCAxLjIyNTczIDcuODQ5OTVDMS40NzkxMSA3LjIzOTQzIDEuOTI3MDQgNi43Mjk2OCAyLjQ5OTkyIDYuMzk5OUMyLjQ5OTkyIDQuOTQxMjEgMy4wNzkzOSAzLjU0MjI2IDQuMTEwODQgMi41MTA4MkM1LjE0MjI5IDEuNDc5MzYgNi41NDEyMyAwLjg5OTkwMiA3Ljk5OTkyIDAuODk5OTAyQzkuNDU4NjEgMC44OTk5MDIgMTAuODU3NiAxLjQ3OTM2IDExLjg4OSAyLjUxMDgyQzEyLjkyMDUgMy41NDIyNiAxMy40OTk5IDQuOTQxMjEgMTMuNDk5OSA2LjM5OTlaTTMuOTk5OTIgNi45OTk5QzMuNDY5NDkgNi45OTk5IDIuOTYwNzggNy4yMTA2MiAyLjU4NTcxIDcuNTg1NjlDMi4yMTA2NCA3Ljk2MDc2IDEuOTk5OTIgOC40Njk0NyAxLjk5OTkyIDguOTk5OUMxLjk5OTkyIDkuNTMwMzQgMi4yMTA2NCAxMC4wMzkgMi41ODU3MSAxMC40MTQxQzIuOTYwNzggMTAuNzg5MiAzLjQ2OTQ5IDEwLjk5OTkgMy45OTk5MiAxMC45OTk5VjYuOTk5OVpNMTMuOTk5OSA4Ljk5OTlDMTMuOTk5OSA4LjQ2OTQ3IDEzLjc4OTIgNy45NjA3NiAxMy40MTQxIDcuNTg1NjlDMTMuMDM5MSA3LjIxMDYyIDEyLjUzMDQgNi45OTk5IDExLjk5OTkgNi45OTk5VjEwLjk5OTlDMTIuNTMwNCAxMC45OTk5IDEzLjAzOTEgMTAuNzg5MiAxMy40MTQxIDEwLjQxNDFDMTMuNzg5MiAxMC4wMzkgMTMuOTk5OSA5LjUzMDM0IDEzLjk5OTkgOC45OTk5WiIgZmlsbD0id2hpdGUiLz4NCjwvc3ZnPg=="},835:M=>{M.exports='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path fill="#000" d="M.438 1C.196 1 0 1.224 0 1.5s.196.5.438.5h15.125c.241 0 .437-.224.437-.5s-.196-.5-.437-.5zM0 7.5c0-.276.196-.5.438-.5h15.125c.241 0 .437.224.437.5s-.196.5-.437.5H.438C.196 8 0 7.776 0 7.5M0 13.5c0-.276.196-.5.438-.5h15.125c.241 0 .437.224.437.5s-.196.5-.437.5H.438C.196 14 0 13.776 0 13.5"></path></svg>'},888:M=>{"use strict";M.exports=t},967:M=>{M.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2IiBmaWxsPSJub25lIj4NCjxwYXRoIGQ9Ik0xNSAxVjEySDYuNzEwOTRMMyAxNS43MTA5VjEySDFWMUgxNVpNMiAyVjNIMTRWMkgyWk0xNCAxMVY0SDJWMTFINFYxMy4yODkxTDYuMjg5MDYgMTFIMTRaTTkgNUgxM1YxMEg5VjVaTTEwIDlIMTJWNkgxMFY5Wk0zIDZIOFY3SDNWNlpNMyA4SDhWOUgzVjhaIiBmaWxsPSJ3aGl0ZSIvPg0KPC9zdmc+"}},e={};function j(N){var i=e[N];if(void 0!==i)return i.exports;var t=e[N]={exports:{}};return M[N](t,t.exports,j),t.exports}j.n=M=>{var e=M&&M.__esModule?()=>M.default:()=>M;return j.d(e,{a:e}),e},j.d=(M,e)=>{for(var N in e)j.o(e,N)&&!j.o(M,N)&&Object.defineProperty(M,N,{enumerable:!0,get:e[N]})},j.o=(M,e)=>Object.prototype.hasOwnProperty.call(M,e),j.r=M=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(M,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(M,"__esModule",{value:!0})},j.p="";var g={};return j.p=window.jimuConfig.baseUrl,(()=>{"use strict";j.r(g),j.d(g,{__set_webpack_public_path__:()=>k,default:()=>d});var M=j(386),e=j(244),N=j(321),i=j(888);const t={createNew:"Create new",newExperience:"New experience",developerEdition:"Developer Edition",linkToHome:"Home",linkToMapViewer:"Map",linkToSceneViewer:"Scene",linkToNotebooks:"Notebooks",linkToGroups:"Groups",linkToContent:"Content",linkToOrganization:"Organization",expressModeLabel:"Express mode"};var D=j(545),s=j(835),o=j.n(s),r=function(M,e){var N={};for(var i in M)Object.prototype.hasOwnProperty.call(M,i)&&e.indexOf(i)<0&&(N[i]=M[i]);if(null!=M&&"function"==typeof Object.getOwnPropertySymbols){var t=0;for(i=Object.getOwnPropertySymbols(M);t<i.length;t++)e.indexOf(i[t])<0&&Object.prototype.propertyIsEnumerable.call(M,i[t])&&(N[i[t]]=M[i[t]])}return N};const I=N=>{const i=window.SVG,{className:t}=N,D=r(N,["className"]),s=(0,e.classNames)("jimu-icon jimu-icon-component",t);return i?(0,M.jsx)(i,Object.assign({className:s,src:o()},D)):(0,M.jsx)("svg",Object.assign({className:s},D))};var a=j(745),T=j.n(a),u=function(M,e){var N={};for(var i in M)Object.prototype.hasOwnProperty.call(M,i)&&e.indexOf(i)<0&&(N[i]=M[i]);if(null!=M&&"function"==typeof Object.getOwnPropertySymbols){var t=0;for(i=Object.getOwnPropertySymbols(M);t<i.length;t++)e.indexOf(i[t])<0&&Object.prototype.propertyIsEnumerable.call(M,i[t])&&(N[i[t]]=M[i[t]])}return N};const l=N=>{const i=window.SVG,{className:t}=N,D=u(N,["className"]),s=(0,e.classNames)("jimu-icon jimu-icon-component",t);return i?(0,M.jsx)(i,Object.assign({className:s,src:T()},D)):(0,M.jsx)("svg",Object.assign({className:s},D))};var c=j(75),x=j.n(c),n=function(M,e){var N={};for(var i in M)Object.prototype.hasOwnProperty.call(M,i)&&e.indexOf(i)<0&&(N[i]=M[i]);if(null!=M&&"function"==typeof Object.getOwnPropertySymbols){var t=0;for(i=Object.getOwnPropertySymbols(M);t<i.length;t++)e.indexOf(i[t])<0&&Object.prototype.propertyIsEnumerable.call(M,i[t])&&(N[i[t]]=M[i[t]])}return N};const A=N=>{const i=window.SVG,{className:t}=N,D=n(N,["className"]),s=(0,e.classNames)("jimu-icon jimu-icon-component",t);return i?(0,M.jsx)(i,Object.assign({className:s,src:x()},D)):(0,M.jsx)("svg",Object.assign({className:s},D))};var z;!function(M){M.AppList="applist",M.TemplateList="templatelist"}(z||(z={}));const y="exb-site-express",O=["myProfile","mySettings","myEsri"],p=[{key:"getStarted",icon:j(17),href:"https://www.esri.com/en-us/arcgis/products/arcgis-experience-builder/overview"},{key:"arcgisBlog",icon:j(967),href:"https://www.esri.com/arcgis-blog/products/arcgis-online"},{key:"esriCommunity",icon:j(550),href:"https://community.esri.com"},{key:"training",icon:j(561),href:"https://www.esri.com/training/arcgis-online-training"},{key:"helpCenter",icon:j(754),href:null,helpUtilsName:"getHomeHelpLink"},{key:"marketplace",icon:j(284),href:"https://www.esri.com/en-us/arcgis-marketplace/products?s=Newest&product=expBuilderDevEd"},{key:"faq",icon:j(149),href:null,helpUtilsName:"getFAQLink"}];window.jimuConfig.isDevEdition||p.push({key:"forDevelopers",icon:j(258),href:"https://developers.arcgis.com/experience-builder"});const L={key:"learnMore",icon:null,href:null,helpUtilsName:"getBuildAppsHelpLink",helpId:"express-mode"};class E extends e.React.PureComponent{constructor(M){super(M),this.helpBtnRef=e.React.createRef(),this.titleTextInput=e.React.createRef(),this.spanTextInput=e.React.createRef(),this.initIsExpressModeWhenClickForwardOrBackOfBrowser=()=>{this.initIsExpressMode(!1)},this.initIsExpressMode=(M=!0)=>{const{queryObject:N}=this.props;let i=!1;if("express"in N)i="true"===(null==N?void 0:N.express)||"1"===(null==N?void 0:N.express);else if(M){e.utils.readLocalStorage(y)&&(i=!0,e.jimuHistory.changeQueryObject({express:"true"}))}this.toggleExpressMode(i)},this.focusEditTitle=()=>{this.titleTextInput.current.select()},this.titleTextChange=M=>{const e=M.target.value;this.setState({titleText:e})},this.newApp=()=>{this.setState({menuPopoverOpen:!1}),e.jimuHistory.changePage("template")},this.handleKeydown=M=>{"Enter"===M.key&&this.titleTextInput.current.blur()},this.toggleResourcePopover=()=>{const M=!this.state.resourcePopoverOpen;M||(0,e.focusElementInKeyboardMode)(this.helpBtnRef.current),this.setState({resourcePopoverOpen:M})},this.toggleNav=M=>{this.setState({views:M})},this.initViews=()=>{const M=this.getQueryString("views");let e=z.AppList;switch(M){case z.AppList:e=z.AppList;break;case z.TemplateList:e=z.TemplateList}this.setState({views:e})},this.checkUserPrivilege=()=>{const{CheckTarget:M}=e.privilegeUtils;e.privilegeUtils.checkExbAccess(M.AppList).then(M=>{this.setState({valid:null==M?void 0:M.valid})})},this.onSimpleModeToggle=M=>{var N;const{views:i}=this.state;i===z.TemplateList&&(null===(N=this.experiencesLinkRef)||void 0===N||N.click()),e.jimuHistory.changeQueryObject({express:M?"true":null}),this.toggleExpressMode(M)},this.toggleExpressMode=M=>{window.isExpressBuilder=M,clearTimeout(this.toggleExpressModeTimeout),this.toggleExpressModeTimeout=setTimeout(()=>{const N=(0,e.getAppStore)().getState().appConfig,t=M?i.utils.getCustomThemeOfExpressMode():null,D=N.set("customTheme",t);(0,e.getAppStore)().dispatch(e.appActions.appConfigChanged(D)),M?e.utils.setLocalStorage(y,`${M}`):e.utils.removeFromLocalStorage(y)},100),this.setState({isExpressMode:M}),(0,e.getAppStore)().dispatch(e.appActions.widgetStatePropChange("header","isExpressMode",M))},this.handleMenuItemKeyDown=M=>{"Enter"!==M.key&&" "!==M.key||M.currentTarget.click()},this.appTaskToggle=this.appTaskToggle.bind(this),this.state={appTaskDropdown:!1,titleText:"",titleLength:0,menuPopoverOpen:!1,resourcePopoverOpen:!1,areResourceAndExpressModeLinksReady:!p.concat(L).some(M=>!M.href),views:z.AppList,valid:!1,isExpressMode:!1,supportNoteBooks:!1,jimuForBuilder:null}}componentDidMount(){e.moduleLoader.loadModule("jimu-for-builder").then(M=>{this.setState({jimuForBuilder:M},()=>{this.initResourceLinks()})}),this.checkUserPrivilege(),this.initViews(),this.initIsExpressMode(),window.addEventListener("popstate",this.initIsExpressModeWhenClickForwardOrBackOfBrowser),e.portalUrlUtils.isAGOLDomain(this.props.portalUrl)&&e.portalUtils.getPortalSigninSettings(this.props.portalUrl).then(M=>{var e;this.setState({supportNoteBooks:!(null===(e=M.blockedApps)||void 0===e?void 0:e.includes("arcgisnotebooks"))})}).catch(M=>{console.error("Failed to get portal signin settings:",M)})}componentWillUnmount(){window.removeEventListener("popstate",this.initIsExpressModeWhenClickForwardOrBackOfBrowser)}initResourceLinks(){this.state.areResourceAndExpressModeLinksReady||Promise.all(p.concat(L).map(M=>{var e,N,i;return!M.href&&M.helpUtilsName?null===(i=null===(N=null===(e=this.state.jimuForBuilder)||void 0===e?void 0:e.helpUtils)||void 0===N?void 0:N[M.helpUtilsName])||void 0===i?void 0:i.call(N,M.helpId).then(e=>(M.href=e,e)):Promise.resolve(M.href)})).catch(()=>{console.warn("Failed to get resource links")}).finally(()=>{this.setState({areResourceAndExpressModeLinksReady:!0})})}getMenuUrls(){let M=[{key:"linkToHome",href:`${this.props.portalUrl}/home/index.html`},{key:"linkToMapViewer",href:`${this.props.portalUrl}/apps/mapviewer/index.html`},{key:"linkToSceneViewer",href:`${this.props.portalUrl}/home/webscene/viewer.html`}];return this.state.supportNoteBooks&&(M=M.concat({key:"linkToNotebooks",href:`${this.props.portalUrl}/home/notebook/notebookhome.html#myNotebooks`})),M=M.concat([{key:"linkToGroups",href:`${this.props.portalUrl}/home/groups.html`},{key:"linkToContent",href:`${this.props.portalUrl}/home/content.html`},{key:"linkToOrganization",href:`${this.props.portalUrl}/home/organization.html`}]),M}getStyle(){const M=this.props.theme,N=window.jimuConfig.isDevEdition?`'(${this.props.intl.formatMessage({id:"developerEdition",defaultMessage:t.developerEdition})})'`:"";return e.css`
      min-height: 50px;
      min-width: 960px;
      background-color: ${M.ref.palette.neutral[500]};
      border-top: 1px solid ${M.ref.palette.neutral[700]};
      border-bottom: 1px solid ${M.ref.palette.neutral[700]};
      padding-left: 16px;

      .help-icon:hover, .help-icon-active {
        color: var(--sys-color-action-hint);
      }

      .header-dropdown-button {
        background-color: transparent;
        border: none;
      }

      .expression-mode-label {
        color: var(--sys-color-surface-overlay-hint);
        font-size: 14px;
        font-weight: 500;
      }

      h6.express-mode-con {
        margin-bottom: 0;
        font-weight: 400;
        color: var(--sys-color-surface-overlay-hint);
      }
      .widget-site-header {
        width: 100%;

        .header-nav-bar-con {
          & {
            margin-left:${e.polished.rem(92)};
            padding-top: 0;
            padding-bottom: 0;
            height: 100%;
          }
          .jimu-nav {
            border:none;
            height: 100%;
          }
          .navbar-nav .nav-item {
            margin-left: ${e.polished.rem(20)};
            overflow: inherit;
          }
          .navbar-nav .nav-link {
            color: ${M.ref.palette.neutral[1e3]};
            white-space: nowrap;
            line-height: ${e.polished.rem(30)};
            margin-left: ${e.polished.rem(12)};
            width: auto;
            font-weight: 500;
          }
          .navbar-nav .nav-link .jimu-nav-link-wrapper{
            margin-bottom: ${e.polished.rem(-4)};
          }
          .nav-link.active {
            color: #E3E3E3;
            font-weight: 500;
            box-sizing: border-box;
            border-color: var(--sys-color-primary-light);
          }
          .navbar-nav .nav-link:hover, .navbar-nav .nav-link:focus {
            color: #E3E3E3;
          }
        }
        .header-logo {
          .header-logo-item {
            height: 26px;
            width: 26px;
          }

          .header-logo-container {
            display: block;
            position: relative;
          }

          .header-logo-label {
            font-size: 16px;
            font-weight: 500;
            color: #E3E3E3;
          }

          .header-logo-label:hover {
            text-decoration: none;
          }

          .header-logo-label:after {
            color:  #A6A6A6;
            font-size: 10px;
            font-weight: 900;
            content: ${N};
          }

          .header-logo-label:not(:disabled):not(.disabled):active {
            color: ${M.ref.palette.black};
          }
        }

        .header-nav-item:not(.active) {
          font-size: 14px;
          font-weight: 500;
          color: var(--sys-color-surface-background-hint);
        }
        .header-nav-item.active {
          font-size: 16px;
          font-weight: 600;
          color: #E3E3E3;
        }

        .header-dropdown {
          float: left;
          color: ${M.ref.palette.black};

          div {
            background-color: ${M.ref.palette.neutral[500]};
          }

          &:hover {
            background-color: ${M.ref.palette.white};
          }
        }

        .header-login {
          cursor: pointer;
          fill: ${M.ref.palette.black};
        }

        .header-dropdown {
          user-select: none;
          transition: none;
        }

        .header-account {
          float: left;
          color: ${M.ref.palette.black};

          div {
            background-color: initial;
          }

        }
        @media (max-width: 1080px) {
          .header-nav-bar-con {
            margin-left:${e.polished.rem(10)};
          }
        }
      }

      .popover-item {
        padding: 0.75rem ${e.polished.rem(16)};

        .popover-item-icon {
          fill: ${M.ref.palette.black};
          color: ${M.ref.palette.black};
        }

        .popover-item-label {
          color: ${M.ref.palette.black}
        }

        &:hover {
          background-color: ${M.sys.color.primary.main};
          color: ${M.ref.palette.black}
        }

      }`}appTaskToggle(){this.setState(M=>({appTaskDropdown:!M.appTaskDropdown}))}getSnapshotBeforeUpdate(M,e){return!(!this.props.queryObject.id||M.queryObject.id===this.props.queryObject.id)}componentDidUpdate(M,e,N){N&&this.setState({titleText:""}),this.spanTextInput.current&&this.state.titleLength!==this.spanTextInput.current.offsetWidth&&this.setState({titleLength:this.spanTextInput.current.offsetWidth+2})}getQueryString(M){const e=new RegExp("(^|&)"+M+"=([^&]*)(&|$)","i"),N=window.location.search.substr(1).match(e);return null!=N?unescape(N[2]):null}render(){var i,s,g;const{isExpressMode:o}=this.state,r=null===(i=this.state.jimuForBuilder)||void 0===i?void 0:i.utils.getHomePageUrl(o,"experienceslist"),a=null===(s=this.state.jimuForBuilder)||void 0===s?void 0:s.utils.getHomePageUrl(o,"templatelist"),T=this.props.intl.formatMessage({id:"help",defaultMessage:N.defaultMessages.help}),u=this.props.intl.formatMessage({id:"gallery",defaultMessage:N.defaultMessages.gallery});return(0,M.jsxs)("div",{css:this.getStyle(),className:"h-100 d-flex justify-content-center",children:[(0,M.jsxs)("div",{className:"widget-site-header d-flex justify-content-between h-100 border-left-0 border-right-0 border-top-0",children:[(0,M.jsxs)("div",{className:"header-logo d-flex align-items-center",children:[(0,M.jsxs)(N.Dropdown,{className:"mr-2",children:[(0,M.jsx)(N.DropdownButton,{className:"header-dropdown-button",arrow:!1,icon:!0,children:(0,M.jsx)(I,{})}),(0,M.jsx)(N.DropdownMenu,{css:"\n              .jimu-dropdown-item {\n                padding: 11px 16px;\n                font-weight: 500;\n                color: var(--ref-palette-black);\n              }\n            ",children:this.getMenuUrls().map(e=>(0,M.jsx)(N.DropdownItem,{onKeyDown:this.handleMenuItemKeyDown,target:"_blank",href:e.href,children:this.props.intl.formatMessage({id:e.key,defaultMessage:t[e.key]})},e.key))})]}),(0,M.jsx)("img",{className:"header-logo-item mr-2 d-block",alt:"ArcGIS Experience Builder",src:j(622)}),(0,M.jsx)("div",{children:(0,M.jsx)("h4",{className:"mb-0 font-weight-normal header-logo-container",children:(0,M.jsx)("a",{className:"header-logo-label px-0",href:window.jimuConfig.mountPath,children:"ArcGIS Experience Builder   "})})}),this.state.valid&&!o&&(0,M.jsx)(N.Navbar,{className:"header-nav-bar-con",border:!1,light:!0,children:(0,M.jsxs)(N.Nav,{underline:!0,navbar:!0,justified:!0,fill:!0,children:[(0,M.jsx)(N.NavItem,{onClick:()=>{this.toggleNav(z.AppList)},className:"link-con",children:(0,M.jsx)(N.NavLink,{className:"header-nav-item",ref:M=>{this.experiencesLinkRef=M},active:this.state.views===z.AppList,to:r,children:this.props.intl.formatMessage({id:"experiences",defaultMessage:N.defaultMessages.experiences})})}),(0,M.jsx)(N.NavItem,{onClick:()=>{this.toggleNav(z.TemplateList)},children:(0,M.jsx)(N.NavLink,{className:"header-nav-item",active:this.state.views===z.TemplateList,to:a,children:this.props.intl.formatMessage({id:"templates",defaultMessage:N.defaultMessages.templates})})})]})})]}),(0,M.jsx)("span",{className:"px-1 border font-weight-normal",style:{fontSize:"16px",position:"absolute",opacity:0,whiteSpace:"pre",zIndex:-1},ref:this.spanTextInput,children:this.state.titleText}),(0,M.jsxs)("div",{className:"float-right d-flex align-items-center",style:{margin:"10.5px 16px"},children:[(0,M.jsx)("div",{className:"expression-mode-label mr-2",children:this.props.intl.formatMessage({id:"expressModeLabel",defaultMessage:t.expressModeLabel})}),(0,M.jsx)(D.ExpressModeSwitch,{checked:o,onChange:this.onSimpleModeToggle}),(0,M.jsx)(N.Button,{ref:this.helpBtnRef,title:T,"aria-label":T,className:(0,e.classNames)("border-0 mr-2 help-icon",{"help-icon-active":this.state.resourcePopoverOpen}),icon:!0,size:"sm",type:"tertiary",onClick:this.toggleResourcePopover,"aria-haspopup":"dialog",children:(0,M.jsx)(l,{autoFlip:!e.i18n.isSameLanguage(null===(g=this.props.intl)||void 0===g?void 0:g.locale,"he")})}),this.props.user&&(0,M.jsx)(N.UserProfile,{user:this.props.user,portalUrl:this.props.portalUrl,quickLinks:O})]})]}),(0,M.jsx)(N.Popper,{offsetOptions:8,placement:"bottom-end",open:this.state.resourcePopoverOpen,toggle:this.toggleResourcePopover,reference:this.helpBtnRef,"aria-label":T,children:(0,M.jsxs)("div",{className:"p-6",css:(this.props.theme,e.css`
    width: 520px;

    .section-title {
      color: var(--sys-color-surface-overlay-hint);
      font-size: 18px;
      font-weight: 500;
      line-height: 26px;
      margin-bottom: 12px;
    }
    .section-hint {
      color: var(--sys-color-surface-overlay-hint);
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 22px;
    }

    .resources-container {
      padding-bottom: 16px;
      border-bottom: 1px solid var(--sys-color-divider-secondary);
      .resources-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0;
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .resources-item {
        color: var(--sys-color-surface-overlay-text);
        text-align: center;
        font-size: 14px;
        font-weight: 400;
        line-height: 22px;
        padding: 9px 8px;
        &:hover {
          background-color: var(--sys-color-action-hover);
          color: var(--sys-color-surface-overlay-text);
          text-decoration: none;
        }
      }
    }

    .gallery-container {
      .gallery-hint {
        width: 254px;
      }
      .gallery-image {
        width: 188px;
      }
    }

    .express-mode-container {
      padding: 16px;
      background-color: var(--sys-color-surface-paper);
    }
  `),children:[(0,M.jsxs)("div",{className:"resources-container",children:[(0,M.jsx)("div",{className:"section-title",children:this.props.intl.formatMessage({id:"resources",defaultMessage:N.defaultMessages.resources})}),(0,M.jsx)("ul",{className:"resources-list",children:p.map((e,i)=>{const t=this.props.intl.formatMessage({id:e.key,defaultMessage:N.defaultMessages[e.key]});return(0,M.jsx)("li",{children:(0,M.jsxs)(N.Link,{className:"resources-item d-flex align-items-center",href:e.href,target:"_blank",children:[(0,M.jsx)(N.Icon,{icon:e.icon,size:"m",className:"mr-2"}),(0,M.jsx)("div",{className:"flex-grow-1 text-truncate text-left",title:t,children:t})]})},e.key)})})]}),(0,M.jsxs)("div",{className:"gallery-container mt-6",children:[(0,M.jsx)("div",{className:"section-title",children:u}),(0,M.jsxs)("div",{className:"gallery-top d-flex justify-content-between",children:[(0,M.jsx)("div",{className:"gallery-hint section-hint",children:this.props.intl.formatMessage({id:"galleryHint",defaultMessage:N.defaultMessages.galleryHint})}),(0,M.jsx)("div",{className:"gallery-image",children:(0,M.jsx)("img",{className:"w-100",alt:u,src:"./site/widgets/header/dist/runtime/assets/gallery-image.webp"})})]}),(0,M.jsx)("div",{className:"gallery-bottom",children:(0,M.jsxs)(N.Link,{className:"p-0 section-link gallery-btn mt-2",size:"sm",to:"https://doc.arcgis.com/en/experience-builder/gallery/",target:"_blank",children:[this.props.intl.formatMessage({id:"findYourInspiration",defaultMessage:N.defaultMessages.findYourInspiration}),(0,M.jsx)(A,{autoFlip:!0,className:"gallery-btn-icon ml-2"})]})})]}),(0,M.jsxs)("div",{className:"express-mode-container mt-6",children:[(0,M.jsx)("div",{className:"section-title",children:this.props.intl.formatMessage({id:"expressModeTitle",defaultMessage:N.defaultMessages.expressModeTitle})}),(0,M.jsx)("div",{className:"section-hint",children:this.props.intl.formatMessage({id:"expressModeHint",defaultMessage:N.defaultMessages.expressModeHint})}),(0,M.jsx)(N.Link,{className:"p-0 section-link mt-2",size:"sm",to:L.href,target:"_blank",children:this.props.intl.formatMessage({id:"learnMore",defaultMessage:N.defaultMessages.learnMore})})]})]})})]})}}E.mapExtraStateProps=M=>({queryObject:M.queryObject});const d=E;function k(M){j.p=M}})(),g})())}}});