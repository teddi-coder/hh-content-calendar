import { makeCollectionHandlers } from '@/lib/apiHelper'

const { GET, POST } = makeCollectionHandlers('cal_social_posts')
export { GET, POST }
