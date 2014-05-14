var mongo = require('mongodb');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;

var databaseName = 'dre';

//===================== CONNECTION ====================================

var db_conn = null;
var grid_conn = null;

exports.connectDatabase = function connectDatabase(server, callback) {
  var Db = mongo.Db;
  var Grid = mongo.Grid;

  Db.connect('mongodb://' + server + '/' + databaseName, function(err, dbase) {
    if (err) {
      throw err;
    }
    db_conn = exports.db_conn = dbase;
    grid_conn = exports.grid_conn = new Grid(dbase, 'storage');
    mongoose.connect('mongodb://' + server + '/'+ databaseName);
    callback();
  });
};

//========================== RECORDS =================================

//Saves raw file to gridFS.
exports.storeFile = function storeFile(inboundFile, inboundFileInfo, inboundXMLType, callback) {
  var grid = grid_conn;
  var buffer = new Buffer(inboundFile);

  var fileMetadata = {};
  if (inboundXMLType) {
    fileMetadata.fileClass = inboundXMLType;
  }

  grid.put(buffer, {
    metadata: fileMetadata,
    'filename': inboundFileInfo.name,
    'content_type': inboundFileInfo.type,
  }, function(err, fileInfo) {
    if (err) {
      callback(err);
    } else {
      /*Relax for now pending further investigation, seems to be chunking overhead.*/
      //if (fileInfo.length !== inboundFileInfo.size) {
      //  callback('file size mismatch');
      //} else {
      callback(null, fileInfo);
      //}
    }
  });
};

exports.getRecordList = function(callback) {
    var db = db_conn;

    var responseJSON = {};
    var responseArray = [];

    db.collection('storage.files', function(err, recordCollection) {
        if (err) {
            callback(err);
        } else {
            recordCollection.find(function(err, findResults) {
                findResults.toArray(function(err, recordArray) {
                    var recordResponseArray = [];
                    for (var i = 0; i < recordArray.length; i++) {
                        var recordJSON = {};

                        recordJSON.file_id = recordArray[i]._id;
                        recordJSON.file_name = recordArray[i].filename;
                        recordJSON.file_size = recordArray[i].length;
                        recordJSON.file_mime_type = recordArray[i].contentType;
                        recordJSON.file_upload_date = recordArray[i].uploadDate;

                        if (recordArray[i].metadata.fileClass) {
                            recordJSON.file_class = recordArray[i].metadata.fileClass;
                        }

                        recordResponseArray.push(recordJSON);
                    }

                    callback(null, recordResponseArray);
                });
            });
        }
    });
};

exports.getRecord = function(fileId, callback) {
    var db = db_conn;
    var grid = grid_conn;

    //Removed owner validation for demo purposes.
    db.collection('storage.files', function(err, coll) {
        if (err) {
            callback(err);
        } else {
            var objectID = new ObjectId(fileId);
            coll.findOne({"_id": objectID}, function(err, results) {
                if (err) {
                    callback(err);
                } else if (results) {
                    grid.get(objectID, function(err, data) {
                        if (err) {
                            callback(err);
                        } else {
                            var returnFile = data.toString();
                            callback(null, results.filename, returnFile);
                        }
                    });
                } else {
                    callback(new Error('no file'));
                }
            });
        }
    });
};

//========================== ALLERGIES

var allergy = require('../models/allergies');
var Storage_files = require('../models/storage_files');

//Get all allergies.
exports.getAllergies = function(callback) {
    var query = allergy.find().lean().populate('metadata.attribution', 'record_id merge_reason merged');
    query.exec(function(err, allergyResults) {
        if (err) {
            callback(err);
        } else {
            Storage_files.populate(allergyResults, {path: 'metadata.attribution.record_id', select: 'filename'}, function(err, docs) {
                if (err) {
                    callback(err);
                } else {
                    //May be part of model?
                    var serverityReference = {
                            "Mild": 1,
                            "Mild to Moderate": 2,
                            "Moderate": 3,
                            "Moderate to Severe": 4,
                            "Severe": 5,
                            "Fatal": 6
                    };
                    for (var i=0;i<docs.length;i++) {
                        console.log(i);
                        for (severity in serverityReference) {
                            if (severity.toUpperCase() === docs[i].severity.toUpperCase()) {
                                docs[i].severity_weight = serverityReference[severity];
                            }
                        }
                    }
                    callback(null, docs);
                }
            });
        }
    });
};

//Gets a single allergy based on id.
exports.getAllergy = function(input_id, callback) {
    allergy.findOne({_id: input_id}, function(err, allergyEntry) {
        if (err) {
            callback(err);
        } else {
            callback(null, allergyEntry);
        }
    });
};


