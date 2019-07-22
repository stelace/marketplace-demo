export default {
  // ratings stats are keyed by type defined in config.stelace.instant.ratingsOptions.stats
  // and then keyed by target ID or asset ID

  // { [ratingType1]: { [targetId1]: {}, [targetId2]: {}, ... }, ... }
  ratingsStatsByTargetId: {},

  // { [ratingType1]: { [assetId1]: {}, [assetId2]: {}, ... }, ... }
  ratingsStatsByAssetId: {},

  ratedTransactionsById: {},
}
