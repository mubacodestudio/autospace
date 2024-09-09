import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()

  const config = new DocumentBuilder()
    .setTitle('AutoSpace | Muba')
    .setDescription(
      `The AutoSpace Api
      <h1>Looking for graphql api?</h1>
      Go to <a href="/graphql" target="_blank">graphql</a>.
      Or,
      You might also need to use the <a href="https://studio.apollographql.com/sandbox/explorer?endpoint=http://localhost:3000/graphql" target="_blank">Apollo Explorer</a> for greate experiences.`,
    )
    .setVersion('0.1')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/', app, document)
  await app.listen(8000)
}
bootstrap()
