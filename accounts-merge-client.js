Meteor.signInWithExternalService = function (serviceName, callback) {
  var oldUserId = Meteor.userId();
  var oldLoginToken = Accounts._storedLoginToken();

  var options = {}; // use default scope unless specified
  if (Accounts.ui._options.requestPermissions[serviceName])
    options.requestPermissions = Accounts.ui._options.requestPermissions[serviceName];
  if (Accounts.ui._options.requestOfflineToken[serviceName])
    options.requestOfflineToken = Accounts.ui._options.requestOfflineToken[serviceName];
  if (Accounts.ui._options.forceApprovalPrompt[serviceName])
    options.forceApprovalPrompt = Accounts.ui._options.forceApprovalPrompt[serviceName];

  Meteor["loginWith" + _.capitalize(serviceName)]( options, function (error) {
    if (error) {
      if (typeof callback === 'function') callback (error);
      return;
    }

    var newUserId = Meteor.userId();

    // Not logged in, logging in now.
    if (!oldUserId) {
      if (typeof callback === 'function') callback ();
      return;
    }

    // Login service has already been added, just logging in
    if (newUserId == oldUserId) {
      if (typeof callback === 'function') callback ();
      return;
    }

    // Adding the new login service
    Meteor.call ('mergeAccounts', oldUserId, function (error, result) {
      if (error) {
        if (typeof callback === 'function') callback (error);
        return;
      }

      // Log back in as the original (destination) user
      Meteor.loginWithToken( oldLoginToken, function (error) {
        if (error) {
          if (typeof callback === 'function') callback (error);
          return;
        }
        if (typeof callback === 'function') callback (undefined, newUserId);
      });
    });
  });
};
