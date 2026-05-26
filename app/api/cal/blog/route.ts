import { makeCollectionHandlers } from '@/lib/apiHelper'

const { GET, POST } = makeCollectionHandlers('cal_blog_posts')
export { GET, POST }
