var express = require('express');
var app = module.exports = express();
var record = require('blue-button-record');
var _ = require('underscore');
var bbm = require('blue-button-meta');
var dre = require('../dre/index.js');
var storage = require('../storage/index.js');
var async = require('async');

function reRunMatches(matchComponent, matchUser, callback) {

    //Select all matches for the patient.
    //Get MHR.
    //feed them into DRE.
    //need to re-attribute new/dupe/partial.

    function rebuildSourceEntries(sourceMatches, sourceRecordUser, sourceRecordSections, callback) {

        async.map(sourceMatches, function (matchEntry, srcCallback) {

            //Re-gather partial entry for completeness.
            record.getEntry(matchEntry.entry_type, sourceRecordUser, matchEntry.entry._id, function (err, results) {
                if (err) {
                    srcCallback(err);
                } else {

                    var newResult = _.omit(results, ['_id', 'metadata']);
                    var returnResult = {
                        entry: newResult,
                        record_id: results.metadata.attribution[0].record._id,
                        partial_id: results._id,
                        match_id: matchEntry._id,
                        section: matchEntry.entry_type
                    }

                    srcCallback(null, returnResult);
                }
            });
        }, function (err, newRecord) {
            if (err) {
                callback(err);
            } else {
                callback(null, newRecord);
            }
        });
    }

    function rebuildMHRRecord(mhrSections, mhrRecordUser, callback) {
        var masterHealthRecord = {};
        //Get elements from MHR.
        async.each(mhrSections, function (section, callback) {
            record.getSection(section, mhrRecordUser, function (err, mhrEntries) {
                if (err) {
                    callback(err);
                } else {
                    //console.log(mhrEntries);
                    masterHealthRecord[section] = mhrEntries;
                    callback(null);
                }
            });
        }, function (err) {
            if (err) {
                callback(err);
            } else {
                callback(null, masterHealthRecord);
            }
        });
    }

    function updateMatch(matchUserID, matchSection, matchOriginalEntryID, recordOriginalEntryID, matchNewEntries, matchPartialEntries, callback) {

        //console.log(matchSection);

        //Update old match to archived, archives original match as well.
        record.cancelMatch(matchSection, matchUserID, matchOriginalEntryID, 'ignored', function (err, results) {
            if (err) {
                    callback(err);
            } else {

                if (_.isUndefined(matchNewEntries)) {
                    matchNewEntries = {};
                }

                if (_.isUndefined(matchPartialEntries)) {
                    matchPartialEntries = {};
                }

                storage.saveComponents(matchNewEntries, matchPartialEntries, recordOriginalEntryID, function(err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });

            }
        });

        //Pare down partials to only valid entries.
        /*if (!_.isUndefined(matchPartialEntries)) {
            if (matchPartialEntries[matchSection].length > 0) {
                
                //Should just save new entries to db as new match, since old stuff archived off.

                //For each new parital object, no need to save new entry to db, as old match entry should be maintained.
                //So, should just update partial match to point its entry field to the partial_id, and save it directly to db.


            }
        }*/

        //Then, I will take whatever is in the new Entries, and save those as new records using common entry point.



        //save new match pointing to source record.
        //discard return entry (since I know it already).
        //save added matches to db.

        //console.log(matchUserID);

        //callback();

    }


    record.getMatches(matchComponent, matchUser, "", function (err, matchList) {
        if (err) {
            callback(err);
        } else {

            console.log(matchList);

            //Select elements from partial match for rerun.
            var reRunSections = _.uniq(_.pluck(matchList, 'entry_type'));

            //Generate Source Records for Match.
            rebuildSourceEntries(matchList, matchUser, reRunSections, function (err, sourceMatchRecords) {

                //Generate MHR Records for Match.
                rebuildMHRRecord(reRunSections, matchUser, function (err, mhrMatchRecords) {

                    async.mapSeries(sourceMatchRecords, function(matchRecord, callback) {

                        var formattedMatchRecord = {};
                        formattedMatchRecord[matchRecord.section] = [matchRecord.entry];

                        //console.log(formattedMatchRecord);

                        dre.reconcile(formattedMatchRecord, mhrMatchRecords, matchRecord.record_id, function(err, newResults, partialResults) {

                            updateMatch(matchUser, matchRecord.section, matchRecord.match_id, matchRecord.record_id, newResults, partialResults, function(err, results) {
                                if (err) {
                                    callback(err);
                                } else {
                                    callback(null);    
                                }
                            });
                        });

                    }, function(err, results) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null);
                        }
                        

                    });




                });

            });
        }
    });

}

function updateMerged(updateId, updateComponent, updateIndex, updateParameters, callback) {
    //Gather full match object by ID.
    record.getMatch(updateComponent, 'test', updateId, function (err, resultComponent) {
        if (err) {
            callback(err);
        } else {

            //Gather partial record from db.
            record.getEntry(updateComponent, 'test', resultComponent.entry._id, function (err, recordResults) {
                if (err) {
                    callback(err);
                } else {

                    //NOTE:  Only one attribution merge since a partial.
                    var recordId = recordResults.metadata.attribution[0].record._id;

                    //Update merged entry.
                    record.updateEntry(updateComponent, 'test', resultComponent.matches[updateIndex].match_entry._id, recordId, updateParameters, function (err, updateResults) {
                        if (err) {
                            callback(err);
                        } else {

                            
                            //Use cancel to update to merged.
                            record.cancelMatch(updateComponent, 'test', updateId, 'merged', function (err, results) {
                                if (err) {
                                    callback(err);
                                } else {

                                    //Rerun Matching.
                                    //reRunMatches(updateComponent, 'test', function (err, results) {
                                        callback();
                                    //});
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

function processUpdate(updateId, updateIndex, updateComponent, updateParameters, callback) {
    //Can be 1) Merged, 2) Added, 3) Ignored.

    //TODO:  ADD RERUN MATCH AFTER ADD AS WELL (AND IGNORE, WHY NOT?).

    if (updateParameters.determination === 'added') {
        if (updateComponent === 'demographics') {
            callback('Only one demographic accepted');
        }
        record.acceptMatch(updateComponent, 'test', updateId, 'added', function(err, results) {
            if (err) {
                callback(err);
            } else {
                 //Rerun Matching.
                reRunMatches(updateComponent, 'test', function (err, results) {
                    if (err) {
                        callback(err);
                    } else {
                        callback();
                    }
                });
            }
        });
    }

    if (updateParameters.determination === 'merged') {
        //If determination is merged, overwrite original record, drop source object, and update merge history of object.
        updateMerged(updateId, updateComponent, updateIndex, updateParameters.updated_entry, function (err, results) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    }

    if (updateParameters.determination === 'ignored') {
        record.cancelMatch(updateComponent, 'test', updateId, 'ignored', function(err, results) {
            if (err) {
                callback(err);
            } else {
                //Rerun Matching.
               /* reRunMatches(updateComponent, 'test', function (err, results) {
                    if (err) {
                        callback(err);
                    } else {
                        callback();
                    }
                });*/

                callback();

            }
        })
    }
}

// Get all matches API.
app.get('/api/v1/matches/:component', function (req, res) {

    if (_.contains(bbm.supported_sections, req.params.component) === false) {
        res.send(404);
    } else {
        record.getMatches(req.params.component, 'test', 'procedure problem product allergen vital name smoking_statuses encounter result_set results plan_id payer_name payer number plan_name"', function (err, matchList) {
            if (err) {
                console.error(err);
                res.send(400, err);
            } else {
                var matchJSON = {};
                matchJSON.matches = matchList;
                res.send(matchJSON);
            }
        });
    }
});

// Get single match API.
app.get('/api/v1/match/:component/:record_id', function (req, res) {
    if (_.contains(bbm.supported_sections, req.params.component) === false) {
        res.send(404);
    } else {
        record.getMatch(req.params.component, 'test', req.params.record_id, function (err, match) {
            if (err) {
                res.send(400, err);
            } else {
                res.send(match);
            }
        });
    }
});

//Post partial record updates.
app.post('/api/v1/matches/:component/:record_id', function (req, res) {

    if (_.contains(bbm.supported_sections, req.params.component) === false) {
        res.send(404);
    } else {
        if (_.contains(['added', 'ignored'], req.body.determination)) {
            processUpdate(req.params.record_id, null, req.params.component, req.body, function (err) {
                if (err) {
                    console.error(err);
                    res.send(400, err);
                } else {
                    res.send(200);
                }
            });
        } else {
            res.send(404);
        }
    }
});

//Post partial record updates.
app.post('/api/v1/matches/:component/:record_id/:record_index', function (req, res) {

    if (_.contains(bbm.supported_sections, req.params.component) === false) {
        res.send(404);
    } else {
        if (_.contains(['merged'], req.body.determination)) {
            processUpdate(req.params.record_id, req.params.record_index, req.params.component, req.body, function (err) {
                if (err) {
                    console.error(err);
                    res.send(400, err);
                } else {
                    res.send(200);
                }
            });
        } else {
            res.send(404);
        }
    }
});