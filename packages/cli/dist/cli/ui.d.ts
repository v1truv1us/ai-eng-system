export declare namespace UI {
    const Style: {
        TEXT_HIGHLIGHT: string;
        TEXT_HIGHLIGHT_BOLD: string;
        TEXT_DIM: string;
        TEXT_DIM_BOLD: string;
        TEXT_NORMAL: string;
        TEXT_NORMAL_BOLD: string;
        TEXT_WARNING: string;
        TEXT_WARNING_BOLD: string;
        TEXT_DANGER: string;
        TEXT_DANGER_BOLD: string;
        TEXT_SUCCESS: string;
        TEXT_SUCCESS_BOLD: string;
        TEXT_INFO: string;
        TEXT_INFO_BOLD: string;
    };
    function println(...message: string[]): void;
    function print(...message: string[]): void;
    function error(message: string): void;
    function success(message: string): void;
    function info(message: string): void;
    function warn(message: string): void;
    function header(title: string): void;
}
