db.getCollection('history').aggregate([
{$match:{topic:/TEMPERATURE/}},
 {$group:{_id:"$topic", from:{$min:"$ts"}, to:{$max:"$ts"}, types:{$first:"$type"}, readings:{$sum:"$readings"} } }
])