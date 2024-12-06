import { createVuetify } from "vuetify";
import * as components from 'vuetify/components'
import {VBtn} from 'vuetify/components'
import * as directives from 'vuetify/directives'
import * as labsComponents from 'vuetify/labs/components'


export default defineNuxtPlugin(nuxtApp => {
const vuetify = createVuetify({
components:{
...components, ...labsComponents
},
directives,

ssr: true,
aliases: {
VBtnPrimary: VBtn,
VBtnSecondary: VBtn,
VBtnTertiary: VBtn,
},
defaults: {
VBtnPrimary: {
color: 'primary',
variant: 'flat',
rounded: "0"
},
VBtnSecondary: {
color: 'secondary',
variant: 'flat',
rounded: "0"
},
VBtnTertiary: {
variant: 'plain',
rounded: "0"
},
VTextField:{
variant: 'outlined',
rounded: "0"
},
VAutocomplete:{
variant: 'outlined',
rounded: "0"
},
VTextarea:{
variant: 'outlined',
rounded: "0"
},
VSelect:{
variant: 'outlined',
rounded: "0"
}
},

})

nuxtApp.vueApp.use(vuetify)
})

