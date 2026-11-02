(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
(()=>{"use strict";return[
"[project]/features/listings/DeactivateDialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DeactivateDialog",
    ()=>DeactivateDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/app/page.module.css [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$PanelDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/listings/PanelDialog.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function DeactivateDialog({ title, busy, error, onClose, onConfirm }) {
    _s();
    const [reason, setReason] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$PanelDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PanelDialog"], {
        labelledBy: "deactivate-title",
        busy: busy,
        onClose: onClose,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalHeader,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        id: "deactivate-title",
                        children: "Desactivar publicación"
                    }, void 0, false, {
                        fileName: "[project]/features/listings/DeactivateDialog.tsx",
                        lineNumber: 12,
                        columnNumber: 44
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].closeButton,
                        disabled: busy,
                        onClick: onClose,
                        "aria-label": "Cerrar",
                        children: "×"
                    }, void 0, false, {
                        fileName: "[project]/features/listings/DeactivateDialog.tsx",
                        lineNumber: 13,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/listings/DeactivateDialog.tsx",
                lineNumber: 12,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: [
                    "«",
                    title,
                    "» dejará de ofrecerse. Se conservarán la publicación y su historial."
                ]
            }, void 0, true, {
                fileName: "[project]/features/listings/DeactivateDialog.tsx",
                lineNumber: 14,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].form,
                onSubmit: (event)=>{
                    event.preventDefault();
                    onConfirm(reason);
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].formGrid,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].full,
                            children: [
                                "Motivo de desactivación",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    required: true,
                                    maxLength: 1000,
                                    rows: 4,
                                    value: reason,
                                    disabled: busy,
                                    "aria-describedby": "deactivate-help",
                                    onChange: (event)=>setReason(event.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/features/listings/DeactivateDialog.tsx",
                                    lineNumber: 17,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/features/listings/DeactivateDialog.tsx",
                            lineNumber: 16,
                            columnNumber: 40
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/features/listings/DeactivateDialog.tsx",
                        lineNumber: 16,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                        id: "deactivate-help",
                        children: "El motivo quedará registrado. Máximo 1000 caracteres."
                    }, void 0, false, {
                        fileName: "[project]/features/listings/DeactivateDialog.tsx",
                        lineNumber: 19,
                        columnNumber: 7
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].noticeError,
                        role: "alert",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/features/listings/DeactivateDialog.tsx",
                        lineNumber: 20,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalActions,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].secondaryButton,
                                disabled: busy,
                                onClick: onClose,
                                children: "Conservar publicación"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/DeactivateDialog.tsx",
                                lineNumber: 21,
                                columnNumber: 44
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].primaryButton,
                                disabled: busy || !reason.trim(),
                                children: busy ? "Desactivando…" : "Confirmar desactivación"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/DeactivateDialog.tsx",
                                lineNumber: 22,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/DeactivateDialog.tsx",
                        lineNumber: 21,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/listings/DeactivateDialog.tsx",
                lineNumber: 15,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/features/listings/DeactivateDialog.tsx",
        lineNumber: 11,
        columnNumber: 10
    }, this);
}
_s(DeactivateDialog, "7UEWAMQYLbSJ5KyX+CjY/+uzrYI=");
_c = DeactivateDialog;
var _c;
__turbopack_context__.k.register(_c, "DeactivateDialog");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/features/listings/EstablishmentPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EstablishmentPanel",
    ()=>EstablishmentPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/app/page.module.css [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$DeactivateDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/listings/DeactivateDialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$ListingCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/listings/ListingCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$ListingFormDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/listings/ListingFormDialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$use$2d$establishment$2d$panel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/listings/use-establishment-panel.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function EstablishmentPanel() {
    _s();
    const { state, actions } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$use$2d$establishment$2d$panel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEstablishmentPanel"])();
    const { canManage, deactivating, deactivationBusy, deactivationError, account, categories, categoryLoadError, categoryPathReady, checkingVisibility, editing, establishmentId, establishments, fieldErrors, filter, form, formError, formOpen, listPathReady, listings, loadError, loading, query, saving, selectedEstablishment, success, timeZone, visibilityChecks, visibleListings } = state;
    const { changeEstablishment, checkPublicVisibility, deactivateListing, requestDeactivation, setDeactivating, loadContext, loadListings, logout, openCreate, openEdit, saveListing, setFilter, setForm, setFormOpen, setQuery } = actions;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].shell,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].skipLink,
                href: "#publicaciones",
                children: "Ir a publicaciones"
            }, void 0, false, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 17,
                columnNumber: 40
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].sidebar,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].brand,
                        href: "#inicio",
                        "aria-label": "XFood, panel del establecimiento",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].brandMark,
                                children: "✳"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 19,
                                columnNumber: 96
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "XFood"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 19,
                                columnNumber: 139
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 19,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].workspaceLabel,
                        children: "ESPACIO DE TRABAJO"
                    }, void 0, false, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 20,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].nav,
                        "aria-label": "Navegación del establecimiento",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#inicio",
                                "aria-label": "Inicio del panel",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].navLink,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "⌂"
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 21,
                                        columnNumber: 154
                                    }, this),
                                    " Inicio"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 21,
                                columnNumber: 79
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#publicaciones",
                                "aria-current": "page",
                                "aria-label": "Mis publicaciones",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].navLink} ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].navActive}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "▤"
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 21,
                                        columnNumber: 307
                                    }, this),
                                    " Mis publicaciones"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 21,
                                columnNumber: 179
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 21,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].sideBottom,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].sideHint,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].spark,
                                        children: "✦"
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 22,
                                        columnNumber: 75
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: [
                                            "Menos desperdicio,",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                lineNumber: 22,
                                                columnNumber: 140
                                            }, this),
                                            "más impacto."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 22,
                                        columnNumber: 114
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Cada excedente aprovechado cuenta."
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 22,
                                        columnNumber: 167
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 22,
                                columnNumber: 42
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].profileButton,
                                onClick: ()=>void logout(),
                                title: "Cerrar sesión",
                                "aria-label": "Cerrar sesión",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].avatar,
                                        children: selectedEstablishment?.name?.slice(0, 1) ?? "X"
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 23,
                                        columnNumber: 129
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].profileText,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: selectedEstablishment?.name ?? "Establecimiento"
                                            }, void 0, false, {
                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                lineNumber: 23,
                                                columnNumber: 254
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                                children: "Cerrar sesión"
                                            }, void 0, false, {
                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                lineNumber: 23,
                                                columnNumber: 321
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 23,
                                        columnNumber: 217
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "aria-hidden": "true",
                                        children: "↗"
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 23,
                                        columnNumber: 356
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 23,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 22,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 18,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].main,
                id: "inicio",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].topbar,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].breadcrumb,
                                children: [
                                    "Panel ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "/"
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 27,
                                        columnNumber: 82
                                    }, this),
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: "Mis publicaciones"
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 27,
                                        columnNumber: 97
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 27,
                                columnNumber: 41
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].headerRight,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].liveDot
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 27,
                                        columnNumber: 173
                                    }, this),
                                    " Gestión del establecimiento ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].headerAvatar,
                                        children: selectedEstablishment?.name?.slice(0, 1) ?? "X"
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 27,
                                        columnNumber: 237
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 27,
                                columnNumber: 137
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 27,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].content,
                        id: "publicaciones",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].headingRow,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].eyebrow,
                                                children: "TU ESPACIO DE IMPACTO"
                                            }, void 0, false, {
                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                lineNumber: 29,
                                                columnNumber: 49
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                children: "Mis publicaciones"
                                            }, void 0, false, {
                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                lineNumber: 29,
                                                columnNumber: 108
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].subtitle,
                                                children: "Administra tus excedentes y ayúdalos a encontrar un nuevo destino."
                                            }, void 0, false, {
                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                lineNumber: 29,
                                                columnNumber: 134
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 29,
                                        columnNumber: 44
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].primaryButton,
                                        onClick: openCreate,
                                        disabled: !canManage || saving || deactivationBusy,
                                        children: [
                                            "＋ ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Publicar excedente"
                                            }, void 0, false, {
                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                lineNumber: 29,
                                                columnNumber: 357
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 29,
                                        columnNumber: 241
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 29,
                                columnNumber: 9
                            }, this),
                            establishments.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].establishmentPicker,
                                children: [
                                    "Establecimiento",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        "aria-label": "Establecimiento",
                                        disabled: saving || deactivationBusy,
                                        value: establishmentId,
                                        onChange: (event)=>void changeEstablishment(event.target.value),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "Selecciona el establecimiento"
                                            }, void 0, false, {
                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                lineNumber: 30,
                                                columnNumber: 266
                                            }, this),
                                            establishments.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: item.id,
                                                    children: [
                                                        item.name,
                                                        item.isPrimary ? " · Principal" : ""
                                                    ]
                                                }, item.id, true, {
                                                    fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                    lineNumber: 30,
                                                    columnNumber: 351
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 30,
                                        columnNumber: 100
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 30,
                                columnNumber: 39
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PanelMetrics, {
                                listings: listings,
                                listPathReady: listPathReady && !loading && !loadError && canManage
                            }, void 0, false, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 31,
                                columnNumber: 9
                            }, this),
                            loadError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].noticeError,
                                role: "alert",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "!"
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 32,
                                        columnNumber: 72
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            loadError,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>void loadContext(),
                                                children: "Volver a intentar"
                                            }, void 0, false, {
                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                lineNumber: 32,
                                                columnNumber: 102
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 32,
                                        columnNumber: 86
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 32,
                                columnNumber: 23
                            }, this),
                            success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].noticeSuccess,
                                role: "status",
                                children: [
                                    "✓ ",
                                    success
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 33,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].listHeader,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                children: "Tus excedentes"
                                            }, void 0, false, {
                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                lineNumber: 34,
                                                columnNumber: 49
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "Publicaciones del establecimiento seleccionado"
                                            }, void 0, false, {
                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                lineNumber: 34,
                                                columnNumber: 72
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 34,
                                        columnNumber: 44
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].controls,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].search,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        "aria-hidden": "true",
                                                        children: "⌕"
                                                    }, void 0, false, {
                                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                        lineNumber: 35,
                                                        columnNumber: 44
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        "aria-label": "Buscar publicaciones",
                                                        placeholder: "Buscar publicación...",
                                                        value: query,
                                                        onChange: (event)=>setQuery(event.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                        lineNumber: 35,
                                                        columnNumber: 77
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                lineNumber: 35,
                                                columnNumber: 11
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].filter,
                                                children: [
                                                    "Estado",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        "aria-label": "Estado",
                                                        value: filter,
                                                        onChange: (event)=>setFilter(event.target.value),
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "all",
                                                                children: "Todos"
                                                            }, void 0, false, {
                                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                                lineNumber: 36,
                                                                columnNumber: 145
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                children: "Activa"
                                                            }, void 0, false, {
                                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                                lineNumber: 36,
                                                                columnNumber: 179
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                children: "Agotada"
                                                            }, void 0, false, {
                                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                                lineNumber: 36,
                                                                columnNumber: 202
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                children: "Desactivada"
                                                            }, void 0, false, {
                                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                                lineNumber: 36,
                                                                columnNumber: 226
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                children: "Vencida"
                                                            }, void 0, false, {
                                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                                lineNumber: 36,
                                                                columnNumber: 254
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                        lineNumber: 36,
                                                        columnNumber: 50
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                                lineNumber: 36,
                                                columnNumber: 11
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 34,
                                        columnNumber: 131
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 34,
                                columnNumber: 9
                            }, this),
                            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LoadingCards, {}, void 0, false, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 38,
                                columnNumber: 20
                            }, this) : establishments.length > 1 && !selectedEstablishment ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectEstablishment, {}, void 0, false, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 38,
                                columnNumber: 93
                            }, this) : !canManage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].emptyState,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: account?.role === "Establishment" ? "No hay un establecimiento habilitado" : "Acceso para establecimientos"
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 38,
                                        columnNumber: 167
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Inicia sesión con una cuenta activa y un establecimiento autorizado para administrar publicaciones."
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 38,
                                        columnNumber: 285
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 38,
                                columnNumber: 132
                            }, this) : !listPathReady ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PendingList, {}, void 0, false, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 38,
                                columnNumber: 417
                            }, this) : visibleListings.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EmptyState, {
                                filtered: Boolean(query || filter !== "all"),
                                hasError: Boolean(loadError),
                                onCreate: openCreate,
                                onRetry: ()=>void loadListings(establishmentId)
                            }, void 0, false, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 38,
                                columnNumber: 466
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].cardGrid,
                                children: visibleListings.map((listing)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$ListingCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ListingCard"], {
                                        listing: listing,
                                        categories: categories,
                                        timeZone: timeZone,
                                        visibility: visibilityChecks[listing.id],
                                        checking: checkingVisibility === listing.id,
                                        onEdit: openEdit,
                                        onDeactivate: requestDeactivation,
                                        onCheckVisibility: checkPublicVisibility
                                    }, listing.id, false, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 39,
                                        columnNumber: 78
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].footer,
                                children: [
                                    "XFood ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "·"
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                        lineNumber: 41,
                                        columnNumber: 49
                                    }, this),
                                    " Aprovechar mejor, juntos."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 41,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 28,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 26,
                columnNumber: 5
            }, this),
            deactivating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$DeactivateDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DeactivateDialog"], {
                title: deactivating.title,
                busy: deactivationBusy,
                error: deactivationError,
                onClose: ()=>setDeactivating(null),
                onConfirm: (reason)=>void deactivateListing(reason)
            }, void 0, false, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 44,
                columnNumber: 22
            }, this),
            formOpen && canManage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$ListingFormDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ListingFormDialog"], {
                categories: categories,
                categoryPathReady: categoryPathReady,
                categoryLoadError: categoryLoadError,
                editing: editing,
                errors: fieldErrors,
                form: form,
                formError: formError,
                saving: saving,
                timeZone: timeZone,
                onChange: setForm,
                onClose: ()=>setFormOpen(false),
                onSubmit: saveListing
            }, void 0, false, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 45,
                columnNumber: 31
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
        lineNumber: 17,
        columnNumber: 10
    }, this);
}
_s(EstablishmentPanel, "9B3xoHQeV8RsBvdVHIJlk3d0jsY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$use$2d$establishment$2d$panel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEstablishmentPanel"]
    ];
});
_c = EstablishmentPanel;
function PanelMetrics({ listings, listPathReady }) {
    const active = listings.filter((item)=>item.status === 1 && item.availableQuantity > 0 && item.isFoodFit && new Date(item.pickupDeadlineUtc) > new Date()).length;
    const units = listings.filter((item)=>item.status === 1 && item.isFoodFit && new Date(item.pickupDeadlineUtc) > new Date()).reduce((sum, item)=>sum + item.availableQuantity, 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metrics,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metricCard,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metricIcon,
                        children: "▤"
                    }, void 0, false, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 55,
                        columnNumber: 40
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "Publicaciones"
                    }, void 0, false, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 55,
                        columnNumber: 82
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: [
                            listPathReady ? listings.length : "—",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                children: listPathReady ? " en total" : " sin datos"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 55,
                                columnNumber: 155
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 55,
                        columnNumber: 108
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 55,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metricCard,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metricIcon} ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].iconGreen}`,
                        children: "↗"
                    }, void 0, false, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 56,
                        columnNumber: 40
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "Activas"
                    }, void 0, false, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 56,
                        columnNumber: 107
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: [
                            listPathReady ? active : "—",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                children: listPathReady ? " disponibles" : " sin datos"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 56,
                                columnNumber: 165
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 56,
                        columnNumber: 127
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 56,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metricCard,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].metricIcon} ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].iconGold}`,
                        children: "◷"
                    }, void 0, false, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 57,
                        columnNumber: 40
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "Unidades disponibles"
                    }, void 0, false, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 57,
                        columnNumber: 106
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: [
                            listPathReady ? units : "—",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                children: listPathReady ? " unidades" : " sin datos"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 57,
                                columnNumber: 176
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 57,
                        columnNumber: 139
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 57,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].impactCard,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].impactGlyph,
                        children: "✳"
                    }, void 0, false, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 58,
                        columnNumber: 40
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Tu impacto empieza aquí"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 58,
                                columnNumber: 90
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Publicar excedentes ayuda a que más alimentos lleguen a quienes los necesitan."
                            }, void 0, false, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 58,
                                columnNumber: 130
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 58,
                        columnNumber: 85
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 58,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
        lineNumber: 54,
        columnNumber: 10
    }, this);
}
_c1 = PanelMetrics;
function LoadingCards() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].cardGrid,
        role: "status",
        "aria-label": "Cargando publicaciones",
        "aria-busy": "true",
        children: [
            1,
            2,
            3
        ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].skeleton,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {}, void 0, false, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 63,
                        columnNumber: 179
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 63,
                        columnNumber: 186
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 63,
                        columnNumber: 194
                    }, this)
                ]
            }, item, true, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 63,
                columnNumber: 135
            }, this))
    }, void 0, false, {
        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
        lineNumber: 63,
        columnNumber: 10
    }, this);
}
_c2 = LoadingCards;
function PendingList() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pendingCard,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pendingIcon,
                children: "◷"
            }, void 0, false, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 67,
                columnNumber: 46
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Falta configurar la ruta de publicaciones propias."
                    }, void 0, false, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 67,
                        columnNumber: 94
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            "Configura ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                children: "NEXT_PUBLIC_XFOOD_MY_LISTINGS_PATH"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 67,
                                columnNumber: 174
                            }, this),
                            " en ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                children: ".env.local"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                                lineNumber: 67,
                                columnNumber: 225
                            }, this),
                            " y reinicia Next.js para cargar los datos reales."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 67,
                        columnNumber: 161
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 67,
                columnNumber: 89
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
        lineNumber: 67,
        columnNumber: 10
    }, this);
}
_c3 = PendingList;
function SelectEstablishment() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].emptyState,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                children: "Selecciona un establecimiento"
            }, void 0, false, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 71,
                columnNumber: 45
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: "Elige el establecimiento que quieres administrar para consultar sus publicaciones."
            }, void 0, false, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 71,
                columnNumber: 83
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
        lineNumber: 71,
        columnNumber: 10
    }, this);
}
_c4 = SelectEstablishment;
function EmptyState({ filtered, hasError, onCreate, onRetry }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].emptyState,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].emptyIllustration,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "◌"
                    }, void 0, false, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 75,
                        columnNumber: 87
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                        children: "✦"
                    }, void 0, false, {
                        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                        lineNumber: 75,
                        columnNumber: 101
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 75,
                columnNumber: 45
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                children: hasError ? "No pudimos cargar tus publicaciones" : filtered ? "No hay coincidencias" : "Aún no hay publicaciones"
            }, void 0, false, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 75,
                columnNumber: 115
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: hasError ? "Revisa la conexión e inténtalo de nuevo." : filtered ? "Prueba otro texto o selecciona todos los estados." : "Cuando publiques tu primer excedente, aparecerá aquí con su estado y disponibilidad."
            }, void 0, false, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 76,
                columnNumber: 5
            }, this),
            hasError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].secondaryButton,
                onClick: onRetry,
                children: "Volver a intentar"
            }, void 0, false, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 77,
                columnNumber: 17
            }, this) : !filtered && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].secondaryButton,
                onClick: onCreate,
                children: "Crear primera publicación"
            }, void 0, false, {
                fileName: "[project]/features/listings/EstablishmentPanel.tsx",
                lineNumber: 77,
                columnNumber: 120
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/features/listings/EstablishmentPanel.tsx",
        lineNumber: 75,
        columnNumber: 10
    }, this);
}
_c5 = EmptyState;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "EstablishmentPanel");
__turbopack_context__.k.register(_c1, "PanelMetrics");
__turbopack_context__.k.register(_c2, "LoadingCards");
__turbopack_context__.k.register(_c3, "PendingList");
__turbopack_context__.k.register(_c4, "SelectEstablishment");
__turbopack_context__.k.register(_c5, "EmptyState");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/features/listings/ListingCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ListingCard",
    ()=>ListingCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/app/page.module.css [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/listings/format.ts [app-client] (ecmascript)");
;
;
;
function ListingCard({ listing, categories, timeZone, visibility, checking, onEdit, onDeactivate, onCheckVisibility }) {
    const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getListingStatus"])(listing.status, listing.pickupDeadlineUtc);
    const statusClass = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"][`status${status === "Vencida" ? 4 : listing.status}`] ?? "";
    const visibilityClass = visibility?.kind === "success" ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].visibilitySuccess : visibility?.kind === "missing" ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].visibilityMissing : __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].visibilityError;
    const category = categories.find((item)=>item.id === listing.categoryId)?.name ?? "Excedente";
    const activeSale = listing.mode === 1 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getListingStatus"])(listing.status, listing.pickupDeadlineUtc) === "Activa" && listing.availableQuantity > 0 && listing.isFoodFit;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].listingCard,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].foodVisual,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].foodShape,
                        "aria-hidden": "true",
                        children: "◇"
                    }, void 0, false, {
                        fileName: "[project]/features/listings/ListingCard.tsx",
                        lineNumber: 27,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].categoryPill,
                        children: [
                            category,
                            " · ",
                            listing.mode === 2 ? "Donación" : "Venta"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/ListingCard.tsx",
                        lineNumber: 28,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statusPill} ${statusClass}`,
                        children: status
                    }, void 0, false, {
                        fileName: "[project]/features/listings/ListingCard.tsx",
                        lineNumber: 29,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/listings/ListingCard.tsx",
                lineNumber: 26,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].listingBody,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].listingTop,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            children: listing.title
                        }, void 0, false, {
                            fileName: "[project]/features/listings/ListingCard.tsx",
                            lineNumber: 32,
                            columnNumber: 42
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/features/listings/ListingCard.tsx",
                        lineNumber: 32,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].description,
                        children: listing.description
                    }, void 0, false, {
                        fileName: "[project]/features/listings/ListingCard.tsx",
                        lineNumber: 33,
                        columnNumber: 7
                    }, this),
                    listing.mode === 2 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].priceLine,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: "Donación"
                        }, void 0, false, {
                            fileName: "[project]/features/listings/ListingCard.tsx",
                            lineNumber: 34,
                            columnNumber: 63
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/features/listings/ListingCard.tsx",
                        lineNumber: 34,
                        columnNumber: 29
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].priceLine,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatMoney"])(listing.discountedUnitPrice)
                            }, void 0, false, {
                                fileName: "[project]/features/listings/ListingCard.tsx",
                                lineNumber: 35,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("del", {
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatMoney"])(listing.originalUnitPrice)
                            }, void 0, false, {
                                fileName: "[project]/features/listings/ListingCard.tsx",
                                lineNumber: 35,
                                columnNumber: 68
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].discount,
                                children: listing.originalUnitPrice && listing.discountedUnitPrice ? `${Math.round((1 - listing.discountedUnitPrice / listing.originalUnitPrice) * 100)}% menos` : ""
                            }, void 0, false, {
                                fileName: "[project]/features/listings/ListingCard.tsx",
                                lineNumber: 36,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/ListingCard.tsx",
                        lineNumber: 34,
                        columnNumber: 97
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].cardDetails,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "▦ ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                        children: listing.availableQuantity
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/ListingCard.tsx",
                                        lineNumber: 38,
                                        columnNumber: 51
                                    }, this),
                                    " disponibles"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/ListingCard.tsx",
                                lineNumber: 38,
                                columnNumber: 43
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "◷ Recogida desde ",
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDate"])(listing.pickupStartsAtUtc, timeZone)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/ListingCard.tsx",
                                lineNumber: 38,
                                columnNumber: 104
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "Hasta ",
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDate"])(listing.pickupDeadlineUtc, timeZone)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/ListingCard.tsx",
                                lineNumber: 38,
                                columnNumber: 183
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/ListingCard.tsx",
                        lineNumber: 38,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].cardActions,
                        children: [
                            listing.mode === 1 && (status === "Activa" || status === "Agotada") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].editButton,
                                onClick: ()=>onEdit(listing),
                                children: "Editar"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/ListingCard.tsx",
                                lineNumber: 40,
                                columnNumber: 81
                            }, this),
                            (status === "Activa" || status === "Agotada") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].deactivateButton,
                                onClick: ()=>onDeactivate(listing),
                                children: "Desactivar"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/ListingCard.tsx",
                                lineNumber: 41,
                                columnNumber: 59
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/ListingCard.tsx",
                        lineNumber: 39,
                        columnNumber: 7
                    }, this),
                    activeSale && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].visibilityCheck,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].visibilityButton,
                                onClick: ()=>onCheckVisibility(listing),
                                disabled: checking,
                                children: checking ? "Comprobando búsqueda…" : "Comprobar en búsqueda pública"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/ListingCard.tsx",
                                lineNumber: 44,
                                columnNumber: 9
                            }, this),
                            visibility && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].visibilityResult} ${visibilityClass}`,
                                role: "status",
                                children: visibility.message
                            }, void 0, false, {
                                fileName: "[project]/features/listings/ListingCard.tsx",
                                lineNumber: 45,
                                columnNumber: 24
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/ListingCard.tsx",
                        lineNumber: 43,
                        columnNumber: 22
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/listings/ListingCard.tsx",
                lineNumber: 31,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/features/listings/ListingCard.tsx",
        lineNumber: 25,
        columnNumber: 10
    }, this);
}
_c = ListingCard;
var _c;
__turbopack_context__.k.register(_c, "ListingCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/features/listings/ListingFormDialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ListingFormDialog",
    ()=>ListingFormDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/app/page.module.css [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$PanelDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/listings/PanelDialog.tsx [app-client] (ecmascript)");
;
;
;
function ListingFormDialog(props) {
    const { categories, categoryPathReady, categoryLoadError, editing, errors, form, formError, saving, timeZone, onChange, onClose, onSubmit } = props;
    const update = (key, value)=>onChange({
            ...form,
            [key]: value
        });
    const fieldError = (key)=>errors[key]?.[0];
    const error = (key)=>fieldError(key) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
            id: `error-${key}`,
            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fieldError,
            children: fieldError(key)
        }, void 0, false, {
            fileName: "[project]/features/listings/ListingFormDialog.tsx",
            lineNumber: 25,
            columnNumber: 63
        }, this) : null;
    const inputProps = (key)=>({
            "aria-invalid": Boolean(fieldError(key)),
            "aria-describedby": fieldError(key) ? `error-${key}` : undefined
        });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$PanelDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PanelDialog"], {
        labelledBy: "form-title",
        busy: saving,
        onClose: onClose,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalHeader,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].eyebrow,
                                children: editing ? "ACTUALIZA TU EXCEDENTE" : "NUEVA PUBLICACIÓN"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                lineNumber: 29,
                                columnNumber: 51
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                id: "form-title",
                                children: editing ? "Editar publicación" : "Publicar excedente"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                lineNumber: 29,
                                columnNumber: 149
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                        lineNumber: 29,
                        columnNumber: 46
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].closeButton,
                        onClick: onClose,
                        "aria-label": "Cerrar",
                        disabled: saving,
                        children: "×"
                    }, void 0, false, {
                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            !categoryPathReady && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].noticeWarning,
                children: "El catálogo de categorías no está configurado."
            }, void 0, false, {
                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                lineNumber: 31,
                columnNumber: 30
            }, this),
            !categories.length && categoryPathReady && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].noticeWarning,
                children: [
                    categoryLoadError ? `No se pudo cargar el catálogo: ${categoryLoadError}` : "No hay categorías activas disponibles. Verifica que la migración del catálogo esté aplicada.",
                    " No se puede enviar sin una categoría activa."
                ]
            }, void 0, true, {
                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                lineNumber: 32,
                columnNumber: 51
            }, this),
            formError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].noticeError,
                role: "alert",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "!"
                    }, void 0, false, {
                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                        lineNumber: 33,
                        columnNumber: 70
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: formError
                    }, void 0, false, {
                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                        lineNumber: 33,
                        columnNumber: 84
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                lineNumber: 33,
                columnNumber: 21
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: onSubmit,
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].form,
                noValidate: true,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("fieldset", {
                        disabled: saving,
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].formGrid,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("legend", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].srOnly,
                                children: "Datos de la publicación"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                lineNumber: 35,
                                columnNumber: 65
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].full,
                                children: [
                                    "Título *",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        maxLength: 200,
                                        value: form.title,
                                        onChange: (e)=>update("title", e.target.value),
                                        placeholder: "Ej. Canasta de frutas frescas",
                                        ...inputProps("title")
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                        lineNumber: 36,
                                        columnNumber: 50
                                    }, this),
                                    error("title")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                lineNumber: 36,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].full,
                                children: [
                                    "Descripción *",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        maxLength: 4000,
                                        rows: 3,
                                        value: form.description,
                                        onChange: (e)=>update("description", e.target.value),
                                        placeholder: "Cuéntale a las personas qué incluye el excedente",
                                        ...inputProps("description")
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                        lineNumber: 37,
                                        columnNumber: 55
                                    }, this),
                                    error("description")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                lineNumber: 37,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Categoría *",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: form.categoryId,
                                        onChange: (e)=>update("categoryId", e.target.value),
                                        ...inputProps("categoryId"),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "Selecciona una categoría"
                                            }, void 0, false, {
                                                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                                lineNumber: 38,
                                                columnNumber: 146
                                            }, this),
                                            categories.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: item.id,
                                                    children: item.name
                                                }, item.id, false, {
                                                    fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                                    lineNumber: 38,
                                                    columnNumber: 222
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                        lineNumber: 38,
                                        columnNumber: 29
                                    }, this),
                                    error("categoryId")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                lineNumber: 38,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Cantidad inicial *",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        min: "1",
                                        step: "1",
                                        value: form.initialQuantity,
                                        onChange: (e)=>update("initialQuantity", e.target.value),
                                        ...inputProps("initialQuantity")
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                        lineNumber: 39,
                                        columnNumber: 36
                                    }, this),
                                    error("initialQuantity")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Precio original (DOP) *",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        min: "0.01",
                                        step: "0.01",
                                        value: form.originalUnitPrice,
                                        onChange: (e)=>update("originalUnitPrice", e.target.value),
                                        ...inputProps("originalUnitPrice")
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                        lineNumber: 40,
                                        columnNumber: 41
                                    }, this),
                                    error("originalUnitPrice")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                lineNumber: 40,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Precio con descuento (DOP) *",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        min: "0.01",
                                        step: "0.01",
                                        value: form.discountedUnitPrice,
                                        onChange: (e)=>update("discountedUnitPrice", e.target.value),
                                        ...inputProps("discountedUnitPrice")
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                        lineNumber: 41,
                                        columnNumber: 46
                                    }, this),
                                    error("discountedUnitPrice")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                lineNumber: 41,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].full,
                                children: [
                                    "Indicaciones de recogida *",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        maxLength: 2000,
                                        rows: 2,
                                        value: form.pickupInstructions,
                                        onChange: (e)=>update("pickupInstructions", e.target.value),
                                        placeholder: "¿Dónde y cómo recogerlo?",
                                        ...inputProps("pickupInstructions")
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                        lineNumber: 42,
                                        columnNumber: 68
                                    }, this),
                                    error("pickupInstructions")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Inicio de recogida · ",
                                    timeZone,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "datetime-local",
                                        value: form.pickupStartsAt,
                                        onChange: (e)=>update("pickupStartsAt", e.target.value),
                                        ...inputProps("pickupDeadline")
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                        lineNumber: 43,
                                        columnNumber: 49
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                lineNumber: 43,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                children: [
                                    "Límite de recogida · ",
                                    timeZone,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "datetime-local",
                                        value: form.pickupDeadline,
                                        onChange: (e)=>update("pickupDeadline", e.target.value),
                                        ...inputProps("pickupDeadline")
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                        lineNumber: 44,
                                        columnNumber: 49
                                    }, this),
                                    error("pickupDeadline")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                lineNumber: 44,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].full,
                                children: [
                                    "Instrucciones de pago *",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        maxLength: 1000,
                                        value: form.paymentInstructions,
                                        onChange: (e)=>update("paymentInstructions", e.target.value),
                                        ...inputProps("paymentInstructions")
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                        lineNumber: 45,
                                        columnNumber: 65
                                    }, this),
                                    error("paymentInstructions")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this),
                            !editing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].full} ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].checkboxLabel}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "checkbox",
                                        ...inputProps("foodSafetyDeclared"),
                                        checked: form.foodSafetyDeclared,
                                        onChange: (e)=>update("foodSafetyDeclared", e.target.checked)
                                    }, void 0, false, {
                                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                        lineNumber: 46,
                                        columnNumber: 84
                                    }, this),
                                    " Declaro que los alimentos son aptos para consumo. *",
                                    error("foodSafetyDeclared")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                lineNumber: 46,
                                columnNumber: 24
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].formFootnote,
                        children: "La modalidad de esta publicación es venta y la moneda es DOP, según la API."
                    }, void 0, false, {
                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalActions,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].secondaryButton,
                                onClick: onClose,
                                disabled: saving,
                                children: "Cancelar"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                lineNumber: 49,
                                columnNumber: 46
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].primaryButton,
                                disabled: saving || !categoryPathReady || categories.length === 0,
                                children: saving ? "Guardando…" : editing ? "Guardar cambios" : "Publicar excedente"
                            }, void 0, false, {
                                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                                lineNumber: 49,
                                columnNumber: 156
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/listings/ListingFormDialog.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/listings/ListingFormDialog.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/features/listings/ListingFormDialog.tsx",
        lineNumber: 28,
        columnNumber: 10
    }, this);
}
_c = ListingFormDialog;
var _c;
__turbopack_context__.k.register(_c, "ListingFormDialog");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/features/listings/PanelDialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PanelDialog",
    ()=>PanelDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/app/page.module.css [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function PanelDialog({ children, labelledBy, busy, onClose }) {
    _s();
    const dialog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PanelDialog.useEffect": ()=>{
            const element = dialog.current;
            const previousOverflow = document.body.style.overflow;
            const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            element.showModal();
            document.body.style.overflow = "hidden";
            return ({
                "PanelDialog.useEffect": ()=>{
                    element.close();
                    document.body.style.overflow = previousOverflow;
                    previousFocus?.focus();
                }
            })["PanelDialog.useEffect"];
        }
    }["PanelDialog.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dialog", {
        ref: dialog,
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modal,
        "aria-labelledby": labelledBy,
        "aria-busy": busy,
        onCancel: (event)=>{
            event.preventDefault();
            if (!busy) onClose();
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/features/listings/PanelDialog.tsx",
        lineNumber: 24,
        columnNumber: 10
    }, this);
}
_s(PanelDialog, "UtfO8VS+DT4pQ5LNOKd1nN4+Vak=");
_c = PanelDialog;
var _c;
__turbopack_context__.k.register(_c, "PanelDialog");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/features/listings/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiRequestError",
    ()=>ApiRequestError,
    "apiGetWithHeaders",
    ()=>apiGetWithHeaders,
    "apiRequest",
    ()=>apiRequest
]);
class ApiRequestError extends Error {
    status;
    payload;
    constructor(message, status, payload){
        super(message), this.status = status, this.payload = payload;
        this.name = "ApiRequestError";
    }
}
async function readPayload(response) {
    return response.status === 204 ? undefined : response.json().catch(()=>({}));
}
function throwIfFailed(response, payload) {
    if (!response.ok) {
        throw new ApiRequestError(payload?.message || `Error ${response.status}`, response.status, payload ?? {});
    }
}
function apiUrl(path) {
    return `/api/v1/${path.replace(/^\//, "")}`;
}
async function apiRequest(path, init) {
    const response = await fetch(apiUrl(path), {
        ...init,
        credentials: "same-origin",
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            ...init?.headers
        }
    });
    const payload = await readPayload(response);
    throwIfFailed(response, payload);
    return payload;
}
async function apiGetWithHeaders(path) {
    const response = await fetch(apiUrl(path), {
        credentials: "same-origin",
        cache: "no-store"
    });
    const payload = await readPayload(response);
    throwIfFailed(response, payload);
    return {
        data: payload,
        headers: response.headers
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/features/listings/constants.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EMPTY_FORM",
    ()=>EMPTY_FORM
]);
const EMPTY_FORM = {
    title: "",
    description: "",
    categoryId: "",
    initialQuantity: "1",
    originalUnitPrice: "",
    discountedUnitPrice: "",
    pickupInstructions: "",
    pickupStartsAt: "",
    pickupDeadline: "",
    paymentInstructions: "Pago en el establecimiento",
    foodSafetyDeclared: false
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/features/listings/format.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatDate",
    ()=>formatDate,
    "formatMoney",
    ()=>formatMoney,
    "getListingStatus",
    ()=>getListingStatus,
    "localInputFromUtc",
    ()=>localInputFromUtc,
    "localInputToUtc",
    ()=>localInputToUtc,
    "mapServerErrors",
    ()=>mapServerErrors,
    "rememberEstablishment",
    ()=>rememberEstablishment,
    "toUpdateForm",
    ()=>toUpdateForm,
    "validateSaleForm",
    ()=>validateSaleForm
]);
function getListingStatus(status, deadline) {
    if ((status === 1 || status === 2) && new Date(deadline) <= new Date()) return "Vencida";
    const labels = {
        1: "Activa",
        2: "Agotada",
        3: "Desactivada",
        4: "Vencida"
    };
    return labels[status] ?? "Estado desconocido";
}
function formatMoney(value) {
    if (value == null) return "—";
    return new Intl.NumberFormat("es-DO", {
        style: "currency",
        currency: "DOP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}
function formatDate(value, timeZone) {
    return new Intl.DateTimeFormat("es-DO", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone
    }).format(new Date(value));
}
function localInputToUtc(value, timeZone) {
    const [datePart, timePart] = value.split("T");
    if (!datePart || !timePart) return "";
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    if (![
        year,
        month,
        day,
        hour,
        minute
    ].every(Number.isFinite)) return "";
    const targetTime = Date.UTC(year, month - 1, day, hour, minute);
    let utcGuess = targetTime;
    for(let attempt = 0; attempt < 3; attempt += 1){
        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23"
        }).formatToParts(new Date(utcGuess));
        const partValue = (type)=>Number(parts.find((part)=>part.type === type)?.value ?? 0);
        const displayedTime = Date.UTC(partValue("year"), partValue("month") - 1, partValue("day"), partValue("hour"), partValue("minute"));
        utcGuess += targetTime - displayedTime;
    }
    return new Date(utcGuess).toISOString();
}
function localInputFromUtc(value, timeZone) {
    const formatted = new Intl.DateTimeFormat("sv-SE", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).format(new Date(value));
    return formatted.replace(" ", "T");
}
function validateSaleForm(form, timeZone) {
    const errors = {};
    const add = (field, message)=>{
        errors[field] = [
            ...errors[field] ?? [],
            message
        ];
    };
    if (!form.title.trim() || form.title.length > 200) {
        add("title", "Escribe un título de hasta 200 caracteres.");
    }
    if (!form.description.trim() || form.description.length > 4000) {
        add("description", "La descripción es obligatoria y admite hasta 4000 caracteres.");
    }
    if (!form.categoryId) add("categoryId", "Selecciona una categoría.");
    if (!Number.isInteger(Number(form.initialQuantity)) || Number(form.initialQuantity) < 1) {
        add("initialQuantity", "La cantidad debe ser un entero mayor que cero.");
    }
    const original = Number(form.originalUnitPrice);
    const discounted = Number(form.discountedUnitPrice);
    if (!(original > 0)) add("originalUnitPrice", "El precio original debe ser mayor que cero.");
    if (!(discounted > 0) || discounted >= original) {
        add("discountedUnitPrice", "El precio con descuento debe ser positivo y menor que el original.");
    }
    if (!form.pickupInstructions.trim() || form.pickupInstructions.length > 2000) {
        add("pickupInstructions", "Indica cómo recoger el pedido (hasta 2000 caracteres).");
    }
    if (!form.paymentInstructions.trim() || form.paymentInstructions.length > 1000) {
        add("paymentInstructions", "Las instrucciones de pago son obligatorias (hasta 1000 caracteres).");
    }
    if (!form.foodSafetyDeclared) {
        add("foodSafetyDeclared", "Debes declarar que el excedente es apto para consumo.");
    }
    const startsAt = localInputToUtc(form.pickupStartsAt, timeZone);
    const deadline = localInputToUtc(form.pickupDeadline, timeZone);
    if (!startsAt || !deadline || new Date(startsAt) >= new Date(deadline) || new Date(deadline) <= new Date()) {
        add("pickupDeadline", "La recogida debe iniciar antes del límite y terminar en una fecha futura.");
    }
    return errors;
}
function mapServerErrors(errors) {
    const normalized = {};
    for (const [key, messages] of Object.entries(errors ?? {})){
        const field = key.charAt(0).toLowerCase() + key.slice(1);
        const target = field === "pickupStartsAtUtc" || field === "pickupDeadlineUtc" ? "pickupDeadline" : field;
        normalized[target] = [
            ...normalized[target] ?? [],
            ...messages
        ];
    }
    return normalized;
}
function toUpdateForm(listing, timeZone) {
    return {
        title: listing.title,
        description: listing.description,
        categoryId: listing.categoryId,
        initialQuantity: String(listing.initialQuantity),
        originalUnitPrice: String(listing.originalUnitPrice ?? ""),
        discountedUnitPrice: String(listing.discountedUnitPrice ?? ""),
        pickupInstructions: listing.pickupInstructions,
        pickupStartsAt: localInputFromUtc(listing.pickupStartsAtUtc, timeZone),
        pickupDeadline: localInputFromUtc(listing.pickupDeadlineUtc, timeZone),
        paymentInstructions: listing.paymentInstructions ?? "",
        foodSafetyDeclared: listing.foodSafetyDeclared
    };
}
function rememberEstablishment(id) {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("establishmentId", id);
    else url.searchParams.delete("establishmentId");
    window.history.replaceState({}, "", url);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/features/listings/use-establishment-panel.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useEstablishmentPanel",
    ()=>useEstablishmentPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/listings/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/listings/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/listings/format.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function useEstablishmentPanel() {
    _s();
    const contextRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const categoryPath = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_XFOOD_CATEGORIES_PATH ?? "categories";
    const categoryPathReady = Boolean(categoryPath);
    const [account, setAccount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [establishmentId, setEstablishmentId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [timeZone, setTimeZone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("America/Santo_Domingo");
    const [coordinates, setCoordinates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [categories, setCategories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [categoryLoadError, setCategoryLoadError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [listings, setListings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [listPathReady, setListPathReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loadError, setLoadError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [formOpen, setFormOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editing, setEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EMPTY_FORM"]);
    const [fieldErrors, setFieldErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [formError, setFormError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [deactivating, setDeactivating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [deactivationError, setDeactivationError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [deactivationBusy, setDeactivationBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [checkingVisibility, setCheckingVisibility] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [visibilityChecks, setVisibilityChecks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const establishments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useEstablishmentPanel.useMemo[establishments]": ()=>account?.establishments?.filter({
                "useEstablishmentPanel.useMemo[establishments]": (item)=>item.status === "Active"
            }["useEstablishmentPanel.useMemo[establishments]"]) ?? []
    }["useEstablishmentPanel.useMemo[establishments]"], [
        account
    ]);
    const selectedEstablishment = establishments.find((item)=>item.id === establishmentId);
    const canManage = account?.role === "Establishment" && account.status === "Active" && Boolean(selectedEstablishment) && !loading;
    const visibleListings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useEstablishmentPanel.useMemo[visibleListings]": ()=>listings.filter({
                "useEstablishmentPanel.useMemo[visibleListings]": (item)=>{
                    const matchesText = `${item.title} ${item.description}`.toLocaleLowerCase().includes(query.toLocaleLowerCase());
                    const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getListingStatus"])(item.status, item.pickupDeadlineUtc);
                    return matchesText && (filter === "all" || status === filter);
                }
            }["useEstablishmentPanel.useMemo[visibleListings]"])
    }["useEstablishmentPanel.useMemo[visibleListings]"], [
        filter,
        listings,
        query
    ]);
    const loadListings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useEstablishmentPanel.useCallback[loadListings]": async (id, signal = contextRequest.current?.signal)=>{
            setLoadError("");
            const path = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_XFOOD_MY_LISTINGS_PATH ?? "establishments/{establishmentId}/listings";
            if (!path) {
                setListPathReady(false);
                setListings([]);
                return;
            }
            setListPathReady(true);
            try {
                const route = path.replace("{establishmentId}", encodeURIComponent(id));
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(route, {
                    signal
                });
                if (signal?.aborted) return;
                setListings(result.filter({
                    "useEstablishmentPanel.useCallback[loadListings]": (item)=>item.establishmentId === id
                }["useEstablishmentPanel.useCallback[loadListings]"]));
            } catch (error) {
                if (signal?.aborted) return;
                setListings([]);
                setLoadError(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiRequestError"] && error.status === 401 ? "Tu sesión terminó. Vuelve a iniciar sesión." : error.message || "No se pudieron cargar las publicaciones.");
            }
        }
    }["useEstablishmentPanel.useCallback[loadListings]"], []);
    const loadProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useEstablishmentPanel.useCallback[loadProfile]": async (id, signal = contextRequest.current?.signal)=>{
            setCoordinates(null);
            const profile = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`establishments/${id}`, {
                signal
            });
            if (signal?.aborted) return;
            if (profile.timeZoneId) setTimeZone(profile.timeZoneId);
            if (typeof profile.latitude === "number" && typeof profile.longitude === "number") {
                setCoordinates({
                    latitude: profile.latitude,
                    longitude: profile.longitude
                });
            }
        }
    }["useEstablishmentPanel.useCallback[loadProfile]"], []);
    const loadContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useEstablishmentPanel.useCallback[loadContext]": async ()=>{
            contextRequest.current?.abort();
            const controller = new AbortController();
            contextRequest.current = controller;
            const { signal } = controller;
            setLoading(true);
            setLoadError("");
            try {
                const currentAccount = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])("me", {
                    signal
                });
                if (signal.aborted) return;
                setAccount(currentAccount);
                if (currentAccount.role !== "Establishment" || currentAccount.status !== "Active") {
                    setListings([]);
                    setLoadError("Esta sección está disponible para una cuenta activa de establecimiento.");
                    return;
                }
                const activeEstablishments = (currentAccount.establishments ?? []).filter({
                    "useEstablishmentPanel.useCallback[loadContext].activeEstablishments": (item)=>item.status === "Active"
                }["useEstablishmentPanel.useCallback[loadContext].activeEstablishments"]);
                const requestedId = new URLSearchParams(window.location.search).get("establishmentId");
                const selected = activeEstablishments.find({
                    "useEstablishmentPanel.useCallback[loadContext]": (item)=>item.id === requestedId
                }["useEstablishmentPanel.useCallback[loadContext]"]) ?? (activeEstablishments.length === 1 ? activeEstablishments[0] : activeEstablishments.find({
                    "useEstablishmentPanel.useCallback[loadContext]": (item)=>item.isPrimary
                }["useEstablishmentPanel.useCallback[loadContext]"]));
                if (!activeEstablishments.length) {
                    setEstablishmentId("");
                    setListings([]);
                    setLoadError("Tu cuenta no tiene un establecimiento activo habilitado para administrar publicaciones.");
                    return;
                }
                if (!selected) {
                    setEstablishmentId("");
                    setListings([]);
                    return;
                }
                setEstablishmentId(selected.id);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rememberEstablishment"])(selected.id);
                await loadProfile(selected.id, signal);
                if (signal.aborted) return;
                await loadListings(selected.id, signal);
            } catch (error) {
                if (signal.aborted) return;
                setAccount(null);
                setListings([]);
                setCoordinates(null);
                setLoadError(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiRequestError"] && error.status === 401 ? "Inicia sesión con una cuenta de establecimiento para continuar." : error.message || "No se pudo conectar con XFood.");
            } finally{
                if (!signal.aborted) setLoading(false);
            }
        }
    }["useEstablishmentPanel.useCallback[loadContext]"], [
        loadListings,
        loadProfile
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useEstablishmentPanel.useEffect": ()=>{
            void loadContext();
            return ({
                "useEstablishmentPanel.useEffect": ()=>contextRequest.current?.abort()
            })["useEstablishmentPanel.useEffect"];
        }
    }["useEstablishmentPanel.useEffect"], [
        loadContext
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useEstablishmentPanel.useEffect": ()=>{
            if (!categoryPath) return;
            void (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(categoryPath).then({
                "useEstablishmentPanel.useEffect": (items)=>{
                    setCategories(items.filter({
                        "useEstablishmentPanel.useEffect": (item)=>item.isActive !== false
                    }["useEstablishmentPanel.useEffect"]));
                    setCategoryLoadError("");
                }
            }["useEstablishmentPanel.useEffect"]).catch({
                "useEstablishmentPanel.useEffect": (error)=>{
                    setCategories([]);
                    setCategoryLoadError(error.message || "No se pudo cargar el catálogo de categorías.");
                }
            }["useEstablishmentPanel.useEffect"]);
        }
    }["useEstablishmentPanel.useEffect"], [
        categoryPath
    ]);
    function openCreate() {
        if (!canManage) return;
        setEditing(null);
        setForm(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EMPTY_FORM"]);
        setFieldErrors({});
        setFormError("");
        setSuccess("");
        setFormOpen(true);
    }
    function openEdit(item) {
        if (!canManage || item.establishmentId !== establishmentId) return;
        setEditing(item);
        setForm((0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toUpdateForm"])(item, timeZone));
        setFieldErrors({});
        setFormError("");
        setSuccess("");
        setFormOpen(true);
    }
    async function saveListing(event) {
        event.preventDefault();
        if (!canManage || saving) return;
        setFormError("");
        setSuccess("");
        const validationErrors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateSaleForm"])(form, timeZone);
        setFieldErrors(validationErrors);
        if (Object.keys(validationErrors).length) return;
        if (!establishmentId || !categories.some((item)=>item.id === form.categoryId)) {
            setFormError("Selecciona una categoría activa del catálogo disponible para poder guardar.");
            return;
        }
        setSaving(true);
        const payload = {
            categoryId: form.categoryId,
            title: form.title.trim(),
            description: form.description.trim(),
            initialQuantity: Number(form.initialQuantity),
            pickupInstructions: form.pickupInstructions.trim(),
            pickupStartsAtUtc: (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["localInputToUtc"])(form.pickupStartsAt, timeZone),
            pickupDeadlineUtc: (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["localInputToUtc"])(form.pickupDeadline, timeZone),
            originalUnitPrice: Number(form.originalUnitPrice),
            discountedUnitPrice: Number(form.discountedUnitPrice),
            paymentInstructions: form.paymentInstructions.trim()
        };
        let savedListing = null;
        try {
            if (editing) {
                savedListing = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`listings/${editing.id}`, {
                    method: "PATCH",
                    body: JSON.stringify(payload)
                });
                setListings((items)=>items.map((item)=>item.id === savedListing?.id ? savedListing : item));
                setSuccess("Publicación actualizada.");
            } else {
                savedListing = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])("listings", {
                    method: "POST",
                    body: JSON.stringify({
                        ...payload,
                        establishmentId,
                        foodSafetyDeclared: true
                    })
                });
                setListings((items)=>[
                        savedListing,
                        ...items.filter((item)=>item.id !== savedListing.id)
                    ]);
                setSuccess("Publicación creada y guardada.");
            }
            setFormOpen(false);
            await loadListings(establishmentId);
            if (savedListing.mode === 1 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getListingStatus"])(savedListing.status, savedListing.pickupDeadlineUtc) === "Activa" && savedListing.availableQuantity > 0) {
                void checkPublicVisibility(savedListing);
            }
        } catch (error) {
            const apiError = error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiRequestError"] ? error : null;
            setFormError(apiError?.status === 409 ? "La publicación cambió mientras la editabas. Se actualizará la lista; revisa los datos antes de volver a intentar." : apiError?.status === 403 ? "La API no autorizó esta operación para el establecimiento seleccionado." : error.message || "No se pudo guardar la publicación.");
            setFieldErrors((0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapServerErrors"])(apiError?.payload.errors));
            if (apiError?.status === 409) await loadListings(establishmentId);
        } finally{
            setSaving(false);
        }
    }
    async function checkPublicVisibility(item) {
        if (item.mode !== 1 || item.status !== 1 || item.availableQuantity < 1 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getListingStatus"])(item.status, item.pickupDeadlineUtc) !== "Activa") {
            setVisibilityChecks((checks)=>({
                    ...checks,
                    [item.id]: {
                        kind: "missing",
                        message: "La búsqueda pública solo muestra ventas activas, vigentes y con unidades disponibles."
                    }
                }));
            return;
        }
        if (!coordinates) {
            setVisibilityChecks((checks)=>({
                    ...checks,
                    [item.id]: {
                        kind: "error",
                        message: "El perfil no tiene coordenadas para comprobar la búsqueda por ubicación."
                    }
                }));
            return;
        }
        setCheckingVisibility(item.id);
        setVisibilityChecks((checks)=>{
            const next = {
                ...checks
            };
            delete next[item.id];
            return next;
        });
        try {
            const options = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])("listings/search-options");
            const params = new URLSearchParams({
                latitude: String(coordinates.latitude),
                longitude: String(coordinates.longitude),
                radiusKm: String(options.defaultRadiusKm),
                pageSize: String(options.maxResults)
            });
            let page = 1;
            let found = false;
            let hasNextPage = true;
            while(hasNextPage && page <= 1000){
                params.set("page", String(page));
                const { data, headers } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiGetWithHeaders"])(`listings?${params.toString()}`);
                if (data.some((result)=>result.id === item.id)) {
                    found = true;
                    break;
                }
                hasNextPage = headers.get("x-has-next-page")?.toLowerCase() === "true";
                page += 1;
            }
            setVisibilityChecks((checks)=>({
                    ...checks,
                    [item.id]: found ? {
                        kind: "success",
                        message: `Aparece en la búsqueda pública dentro del radio configurado de ${options.defaultRadiusKm} km.`
                    } : {
                        kind: "missing",
                        message: hasNextPage ? "La publicación no apareció en las primeras 1000 páginas; limita la búsqueda y vuelve a probar." : `No aparece dentro del radio configurado de ${options.defaultRadiusKm} km. La API excluye ofertas vencidas, agotadas, desactivadas o no aptas.`
                    }
                }));
        } catch (error) {
            setVisibilityChecks((checks)=>({
                    ...checks,
                    [item.id]: {
                        kind: "error",
                        message: error.message || "No se pudo comprobar la búsqueda pública."
                    }
                }));
        } finally{
            setCheckingVisibility("");
        }
    }
    function requestDeactivation(item) {
        if (!canManage || item.establishmentId !== establishmentId) return;
        setDeactivating(item);
        setDeactivationError("");
    }
    async function deactivateListing(reason) {
        const item = deactivating;
        if (!item || !canManage || deactivationBusy) return;
        if (!reason.trim() || reason.trim().length > 1000) {
            setDeactivationError("Indica un motivo de entre 1 y 1000 caracteres.");
            return;
        }
        setDeactivationBusy(true);
        setDeactivationError("");
        try {
            const updated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(`listings/${item.id}/deactivate`, {
                method: "POST",
                body: JSON.stringify({
                    reason: reason.trim()
                })
            });
            setListings((items)=>items.map((entry)=>entry.id === updated.id ? updated : entry));
            setSuccess("Publicación desactivada.");
            setDeactivating(null);
            await loadListings(establishmentId);
        } catch (error) {
            setDeactivationError(error.message || "No se pudo desactivar la publicación.");
        } finally{
            setDeactivationBusy(false);
        }
    }
    async function changeEstablishment(id) {
        if (saving || deactivationBusy) return;
        contextRequest.current?.abort();
        const controller = new AbortController();
        contextRequest.current = controller;
        const { signal } = controller;
        setFormOpen(false);
        setSuccess("");
        setEstablishmentId(id);
        setListings([]);
        setLoading(Boolean(id));
        setLoadError("");
        setVisibilityChecks({});
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rememberEstablishment"])(id);
        if (!id) {
            setLoading(false);
            return;
        }
        try {
            await loadProfile(id, signal);
            if (signal.aborted) return;
            await loadListings(id, signal);
        } catch (error) {
            if (!signal.aborted) setLoadError(error.message || "No se pudo cargar el establecimiento.");
        } finally{
            if (!signal.aborted) setLoading(false);
        }
    }
    async function logout() {
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$listings$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])("auth/logout", {
                method: "POST"
            });
            window.location.reload();
        } catch (error) {
            setLoadError(error.message || "No se pudo cerrar la sesión.");
        }
    }
    return {
        state: {
            account,
            canManage,
            deactivating,
            deactivationBusy,
            deactivationError,
            categories,
            categoryLoadError,
            categoryPathReady,
            checkingVisibility,
            editing,
            establishmentId,
            establishments,
            fieldErrors,
            filter,
            form,
            formError,
            formOpen,
            listPathReady,
            listings,
            loadError,
            loading,
            query,
            saving,
            selectedEstablishment,
            success,
            timeZone,
            visibilityChecks,
            visibleListings
        },
        actions: {
            changeEstablishment,
            checkPublicVisibility,
            deactivateListing,
            requestDeactivation,
            setDeactivating,
            loadContext,
            loadListings,
            logout,
            openCreate,
            openEdit,
            saveListing,
            setFilter,
            setForm,
            setFormOpen,
            setQuery
        }
    };
}
_s(useEstablishmentPanel, "hVY3VZ46RGDNxm60hpLDtxSo/9Y=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]})(),
"[project]/app/page.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "avatar": "page-module__E0kJGG__avatar",
  "brand": "page-module__E0kJGG__brand",
  "brandMark": "page-module__E0kJGG__brandMark",
  "breadcrumb": "page-module__E0kJGG__breadcrumb",
  "cardActions": "page-module__E0kJGG__cardActions",
  "cardDetails": "page-module__E0kJGG__cardDetails",
  "cardGrid": "page-module__E0kJGG__cardGrid",
  "categoryPill": "page-module__E0kJGG__categoryPill",
  "checkboxLabel": "page-module__E0kJGG__checkboxLabel",
  "closeButton": "page-module__E0kJGG__closeButton",
  "content": "page-module__E0kJGG__content",
  "controls": "page-module__E0kJGG__controls",
  "deactivateButton": "page-module__E0kJGG__deactivateButton",
  "description": "page-module__E0kJGG__description",
  "discount": "page-module__E0kJGG__discount",
  "editButton": "page-module__E0kJGG__editButton",
  "emptyIllustration": "page-module__E0kJGG__emptyIllustration",
  "emptyState": "page-module__E0kJGG__emptyState",
  "establishmentPicker": "page-module__E0kJGG__establishmentPicker",
  "eyebrow": "page-module__E0kJGG__eyebrow",
  "fade": "page-module__E0kJGG__fade",
  "fieldError": "page-module__E0kJGG__fieldError",
  "filter": "page-module__E0kJGG__filter",
  "foodShape": "page-module__E0kJGG__foodShape",
  "foodVisual": "page-module__E0kJGG__foodVisual",
  "footer": "page-module__E0kJGG__footer",
  "form": "page-module__E0kJGG__form",
  "formFootnote": "page-module__E0kJGG__formFootnote",
  "formGrid": "page-module__E0kJGG__formGrid",
  "full": "page-module__E0kJGG__full",
  "headerAvatar": "page-module__E0kJGG__headerAvatar",
  "headerRight": "page-module__E0kJGG__headerRight",
  "headingRow": "page-module__E0kJGG__headingRow",
  "iconGold": "page-module__E0kJGG__iconGold",
  "iconGreen": "page-module__E0kJGG__iconGreen",
  "impactCard": "page-module__E0kJGG__impactCard",
  "impactGlyph": "page-module__E0kJGG__impactGlyph",
  "listHeader": "page-module__E0kJGG__listHeader",
  "listingBody": "page-module__E0kJGG__listingBody",
  "listingCard": "page-module__E0kJGG__listingCard",
  "listingTop": "page-module__E0kJGG__listingTop",
  "liveDot": "page-module__E0kJGG__liveDot",
  "main": "page-module__E0kJGG__main",
  "metricCard": "page-module__E0kJGG__metricCard",
  "metricIcon": "page-module__E0kJGG__metricIcon",
  "metrics": "page-module__E0kJGG__metrics",
  "modal": "page-module__E0kJGG__modal",
  "modalActions": "page-module__E0kJGG__modalActions",
  "modalBackdrop": "page-module__E0kJGG__modalBackdrop",
  "modalHeader": "page-module__E0kJGG__modalHeader",
  "moreButton": "page-module__E0kJGG__moreButton",
  "nav": "page-module__E0kJGG__nav",
  "navActive": "page-module__E0kJGG__navActive",
  "navLink": "page-module__E0kJGG__navLink",
  "noticeError": "page-module__E0kJGG__noticeError",
  "noticeSuccess": "page-module__E0kJGG__noticeSuccess",
  "noticeWarning": "page-module__E0kJGG__noticeWarning",
  "panelEnter": "page-module__E0kJGG__panelEnter",
  "pendingCard": "page-module__E0kJGG__pendingCard",
  "pendingIcon": "page-module__E0kJGG__pendingIcon",
  "priceLine": "page-module__E0kJGG__priceLine",
  "primaryButton": "page-module__E0kJGG__primaryButton",
  "profileButton": "page-module__E0kJGG__profileButton",
  "profileText": "page-module__E0kJGG__profileText",
  "pulse": "page-module__E0kJGG__pulse",
  "rise": "page-module__E0kJGG__rise",
  "search": "page-module__E0kJGG__search",
  "secondaryButton": "page-module__E0kJGG__secondaryButton",
  "shell": "page-module__E0kJGG__shell",
  "sideBottom": "page-module__E0kJGG__sideBottom",
  "sideHint": "page-module__E0kJGG__sideHint",
  "sidebar": "page-module__E0kJGG__sidebar",
  "skeleton": "page-module__E0kJGG__skeleton",
  "skipLink": "page-module__E0kJGG__skipLink",
  "spark": "page-module__E0kJGG__spark",
  "srOnly": "page-module__E0kJGG__srOnly",
  "status2": "page-module__E0kJGG__status2",
  "status3": "page-module__E0kJGG__status3",
  "status4": "page-module__E0kJGG__status4",
  "statusPill": "page-module__E0kJGG__statusPill",
  "subtitle": "page-module__E0kJGG__subtitle",
  "topbar": "page-module__E0kJGG__topbar",
  "visibilityButton": "page-module__E0kJGG__visibilityButton",
  "visibilityCheck": "page-module__E0kJGG__visibilityCheck",
  "visibilityError": "page-module__E0kJGG__visibilityError",
  "visibilityMissing": "page-module__E0kJGG__visibilityMissing",
  "visibilityResult": "page-module__E0kJGG__visibilityResult",
  "visibilitySuccess": "page-module__E0kJGG__visibilitySuccess",
  "workspaceLabel": "page-module__E0kJGG__workspaceLabel",
});
}),
]);

//# sourceMappingURL=_004-wo6_-8o6q._.js.map