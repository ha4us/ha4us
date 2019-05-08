db.getCollection('history').aggregate([{
    $match: {
      topic: 'hm/status/Aussenklima/TEMPERATURE',
      ts: {
        "$gte": new Date("2019-02-01T00:00:00.000Z")
      },
      values: {
        $exists: true
      }
    }
  },
  {
    $addFields: {
      date: {
        $dateFromParts: {
          'year': {
            $year: "$ts"
          },
          'month': {
            $month: "$ts"
          },
          'day': {
            $dayOfMonth: "$ts"
          }
        }
      }
    }
  },
  {
    $group: {
      _id: "$date",
      "sum": {
        $sum: "$sum"
      },
      "readings": {
        $sum: "$readings"
      },
      "max": {
        $max: "$max"
      },
      "min": {
        $min: "$min"
      },
    }
  },
  {
    $addFields: {
      "avg": {
        $divide: ["$sum", "$readings"]
      }
    }
  }
]);