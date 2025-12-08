
import type { IntlShape } from 'jimu-core'
import nls from './translations/default'

export const getDefaultEmailContent = (intl: IntlShape) => {
    const shareEmailTxt1 = intl.formatMessage({ id: 'settingEmailText1', defaultMessage: nls.settingEmailText1 })
    const modelTxt = `{appName}\n{appURL}\n\n`
    const shareEmailTxt2 = intl.formatMessage({ id: 'settingEmailText2', defaultMessage: nls.settingEmailText2 })
    const shareEmailTxt3 = intl.formatMessage({ id: 'settingEmailText3', defaultMessage: nls.settingEmailText3 })
    return `${shareEmailTxt1}\n\n${modelTxt}${shareEmailTxt2}\n\n${shareEmailTxt3}`
}