
/**
 * Copyright 2010-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * This file is licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License. A copy of
 * the License is located at
 *
 * http://aws.amazon.com/apache2.0/
 *
 * This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
*/
var AWS = require("aws-sdk");
var fs = require('fs');

AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Importing wordGroups into DynamoDB. Please wait.");

var allItems = JSON.parse(fs.readFileSync('villaindata.json', 'utf8'));
allItems.forEach(function (wordGroup) {
    var params = {
        TableName: "Villain1",
        Item: {
            "POS": wordGroup.POS,
            "Entries": wordGroup.Entries
        }
    };

    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add wordGroup", wordGroup.POS, ". Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("PutItem succeeded:", wordGroup.POS);
        }
    });
});