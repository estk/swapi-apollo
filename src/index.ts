import * as express from 'express'
const apollo = require('apollo-server')

import schema from './schema/index'
import resolvers from './resolvers/index'
import SWAPIConnector from './connectors/swapi'
import FilmModel from './models/film'
import PeopleModel from './models/people'
import VehicleModel from './models/vehicle'
import PlanetModel from './models/planet'
import StarshipModel from './models/starship'
import SpeciesModel from './models/species'

const app = express()

const apiPort = process.env.API_PORT ? `:${process.env.API_PORT}` : ''
const apiHost = process.env.API_HOST ? `${process.env.API_HOST}${apiPort}/api` : 'http://swapi.co/api'
const port = process.env.NODE_PORT || 3000

app.use('/graphql', apollo.apolloServer((req) => {
  const swapiConnector = new SWAPIConnector(apiHost)

  return {
      graphiql: true,
      pretty: true,
      resolvers,
      schema,
      context: {
          film: new FilmModel(swapiConnector),
          vehicle: new VehicleModel(swapiConnector),
          people: new PeopleModel(swapiConnector),
          planet: new PlanetModel(swapiConnector),
          starship: new StarshipModel(swapiConnector),
          species: new SpeciesModel(swapiConnector),
      },
  }
}))

app.listen(port, () => {
    console.log(`Server is listen on ${port}`)
})
