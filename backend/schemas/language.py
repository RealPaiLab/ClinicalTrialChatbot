"""The controlled language vocabulary for trial-content translation."""

from enum import StrEnum


class Language(StrEnum):
    """Languages the summary panel can be rendered in (BCP-47, as Google expects)."""

    EN = "en"
    FR_CA = "fr-CA"
    ES = "es"
    DE = "de"
    HI = "hi"
    ZH_CN = "zh-CN"
    YUE = "yue"

    @property
    def display_name(self) -> str:
        """The language written out, for providers that read a prompt."""
        return LANGUAGE_NAMES[self]


LANGUAGE_NAMES: dict[Language, str] = {
    Language.EN: "English",
    Language.FR_CA: "Canadian French (français canadien)",
    Language.ES: "Spanish (español)",
    Language.DE: "German (Deutsch)",
    Language.HI: "Hindi (हिन्दी)",
    Language.ZH_CN: "Simplified Chinese (简体中文)",
    Language.YUE: "Cantonese, written in traditional characters (廣東話)",
}
