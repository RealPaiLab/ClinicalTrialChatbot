"""The controlled language vocabulary for trial-content translation."""

from enum import StrEnum


class Language(StrEnum):
    """Languages the summary panel can be rendered in (BCP-47, as Google expects)."""

    EN = "en"
    FR_CA = "fr-CA"
    ES = "es"
    PT_BR = "pt-BR"
    DE = "de"
    IT = "it"
    HI = "hi"
    ZH_CN = "zh-CN"
    ZH_TW = "zh-TW"
    YUE = "yue"
