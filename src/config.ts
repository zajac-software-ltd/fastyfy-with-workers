import envSchema from 'env-schema'
import S from 'fluent-json-schema'

const schema = S.object()
  .prop('NODE_ENV', S.string().default('development'))
  .prop('PORT', S.number().default(3000))
  .prop('HOST', S.string().default('0.0.0.0'))

export const config = envSchema<{
  NODE_ENV: string
  PORT: number
  HOST: string
}>({
  schema,
  dotenv: true,
})
