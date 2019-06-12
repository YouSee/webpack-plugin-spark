import Joi from 'joi'

const validateOptions = options => {
  const schema = Joi.object().keys({
    hmr: Joi.boolean(),
    liveReload: Joi.boolean(),
    progress: Joi.boolean(),
    static: Joi.string(),
    port: Joi.number()
      .integer()
      .max(65535),
  })

  return Joi.validate(options, schema)
}

export default validateOptions
