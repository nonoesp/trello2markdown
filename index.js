const fs = require('fs');
const request = require('superagent');
require('dotenv').config()

const destination = "bin/lists.md";
let lists = {};
const trello = {
    key: process.env.TRELLO_KEY,
    token: process.env.TRELLO_TOKEN,
    board: process.env.TRELLO_BOARD
};

request
  .get(`https://api.trello.com/1/boards/${trello.board}/lists/open?fields=name&key=${trello.key}&token=${trello.token}`)
  .end((err, res) => {
    for(var i=0;i<res.body.length;i++) {
        const list = res.body[i];
        lists[list.id] = list.name;
    }
    
    request
  .get(`https://api.trello.com/1/boards/${trello.board}/cards/visible?fields=name,idList&key=${trello.key}&token=${trello.token}`)
    .end((err, res) => {

        let cards = res.body;
        let idList = null;
        let markdown = "";
        
        for(var i = 0; i < cards.length; i++) {
            const card = cards[i];
            if (idList != card.idList) {
                markdown += `
# ${lists[card.idList]}

`;
            }
            markdown += `- ${card.name}
`;
            idList = card.idList;
        }

        console.log(markdown);

        fs.writeFile(destination, markdown, function(err) {
            if(err) {
                return console.log(err);
            }
        
            console.log('Saved Markdown file at ' + destination + '!');
            console.log('');
        });
    });

});