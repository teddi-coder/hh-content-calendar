import { makeCollectionHandlers } from '@/lib/apiHelper'

const { GET, POST } = makeCollectionHandlers('cal_ads')
export { GET, POST }
