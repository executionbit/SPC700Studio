(function (global) {
    "use strict";

    function unexpectedPublishResponseError(response) {
        if (response.status === 404) {
            return new Error(
                "The public-link service could not be found. Refresh the studio and try again.",
            );
        }
        return new Error(
            "The public-link service returned an unexpected page. Refresh the studio and try again.",
        );
    }

    async function readPublishResponse(response) {
        const contentType = String(
            response.headers?.get?.("content-type") || "",
        ).toLowerCase();
        const responseText = await response.text();

        if (!contentType.includes("application/json")) {
            throw unexpectedPublishResponseError(response);
        }
        if (!responseText.trim()) {
            throw new Error(
                "The public-link service returned an empty response. Refresh the studio and try again.",
            );
        }
        try {
            return JSON.parse(responseText);
        } catch (_error) {
            throw new Error(
                "The public-link service returned invalid data. Refresh the studio and try again.",
            );
        }
    }

    const api = { readPublishResponse };
    global.GhettochipPublicLinks = api;
    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }
})(typeof window !== "undefined" ? window : globalThis);