import { makeCollectionHandlers } from '@/lib/apiHelper'

const { GET, POST } = makeCollectionHandlers('cal_email_sends', 'sort_order')
export { GET, POST }
