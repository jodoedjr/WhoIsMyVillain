//index.js
/*//basic index.js app
const serverless = require('serverless-http');
const express = require('express')
const app = express()

app.get('/', function(req, res){
    res.send('Hello One More Test!')
})

module.exports.handler = serverless(app);
*/
const serverless = require('serverless-http');//serverless for deployment
var AWS = require("aws-sdk");//aws-sdk for DynamoDB integration
const express = require('express');//express for easy http
const app = express();
var Promise = require('promise');//DynamoDB getter returns Promises

AWS.config.update({//config AWS region and endpoint for DynamoDB
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var docClient = new AWS.DynamoDB.DocumentClient();//instantiate a DocumentClient to handle my DynamoDB table

var table = "Villain1";//name of my DynamoDB table
var attributeList = [//the 'Key' values for my DynamoDB table - each Key has X number of entries associated with it - this program chooses one of those at random
    "startphrase",
    "adj1",
    "noun1",
    "adj2",
    "noun2",
    "endphrase",
    "subtrait1",
    "subtrait2",
    "subtrait3"
];
var attributeNumEntries = [// these are the number of items stored under the corresponding attribute (startphrase has 6 entries) - will be moved to a table value in the furture
    6,
    20,
    20,
    20,
    27,
    26,
    230,
    230,
    230
]


var params = [];// instantiate params, which will be used to grab the items from my DynamoDB table
//structure of params
/*var params = {
    TableName: table,
    Key: {
        "POS": "adj1"
    },
    ProjectionExpression: "Entries[0]"
};*/

var POS = "intialized"; // POS is an acronym for Part Of Speach
var randNum = 0;//intialize randNum

function asyncFunction(paramsInput) {// asynFunction returns a promise for DynamoDB item retrival - prevents program from completing with undefined POS items

    return new Promise(function (resolve, reject) {// function returns a new promise
        docClient.get(paramsInput, function (err, data) {// attempt to retrive DynamoDB item based on paramInput (params with specific POS and Entrie number)
            if (err) {//if err, print a log to console, reject the Promise, and throw an error
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
                throw new Error("Error: issue calling: " + params.Key + "   and   " + params.ProjectionExpression);
            } else {//else (success), resolve Promise with the string in the Entrie Field
                //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                resolve(String(data.Item.Entries));
            }
        });

    });

}

function startsWithVowel(c) {//test if POS begins with a vowel for use with a vs. an decision
    return ['a', 'e', 'i', 'o', 'u'].indexOf(c.charAt(0).toLowerCase()) !== -1
}


function stringBuilder(input) {//build the syntax of our output string for our webpage
    var outputString = "";

    //sentence structure:   start phrase   " "   (possible 'a')    " "   adj1   " "   noun1    " with "   adj2    " "   noun2    " who "  endphrase
    // "\nSubtraits: "  "\n"subtrait1 "\n"subtrait2  "\n"subtrait3

    outputString = input[0] + (startsWithVowel(input[1]) ? " an " : " a ") + input[1] + " " + input[2] + " with " + input[3] + " " + input[4] + " who " + input[5] + "\n";
    //subtraits may be returned seperately in the future for html purposes
    outputString = outputString + "Subtraits:\n" + input[6] + "\n" + input[7] + "\n" + input[8] + "\n";
    return outputString;
}

async function main(res) {//main function called by app, async so the function can wait on the asyncfunction above
    for (i = 0; i < 9; i++) {//for each POS
        POS = attributeList[i];//set part of speech to be accessed, i.e. "startphrase", or "adj1"
        randNum = Math.floor(Math.random() * Math.floor(attributeNumEntries[i]));//randomly determine which data.item.entry to retrieve, based on number of entries for a given field
        params[i] = {//create an entry in the params array for each POS to be retrieved 
            TableName: table,
            Key: {
                "POS": POS
            },
            ProjectionExpression: "Entries[" + String(randNum) + "]"
        };
    }

    try {//try to get an entry back for every thing in the params array
        let finalArray = params.map(async (paramsInput) => {//map instead of forEach
            const result = await asyncFunction(paramsInput);//wait for the asyncfunction to return with the POS Entry
            finalValue = result; //asignment instruction
            return finalValue;//send finalValue to finalArray
        })

        const resolvedFinalArray = await Promise.all(finalArray); // resolving all promises, resolvedFinalArray should contain all POS strings if no errs
        res.end(stringBuilder(resolvedFinalArray));//print the string that  stringBuilder(resolvedFinalArray) returns to the webpage
    } catch (error) {//if something goes wrong
        console.error(error);//record in log
        res.end(error);//show on website
    }


};


app.get('/', function (req, res) {//use app to call main, and pass response object so main can write an html response
    main(res);
})

module.exports.handler = serverless(app);