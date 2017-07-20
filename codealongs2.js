@terminal:
git remote -v
create heroku app, config vars to map correctly
@heroku:
DOMAIN

@env.sh:
export DOMAIN = "http://localhost:3000"
@rtm.sendMessage:
Please visit ${process.env.DOMAIN}/connect/
@return new OAuth2 -- also process.env.DOMAIN
@google credintials:
authorized redirect URIs:
one more -- https:// ..... herokuapp.com/connect/callback
