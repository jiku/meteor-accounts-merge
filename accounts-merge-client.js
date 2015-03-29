Meteor.signInWithExternalService = function (service, options, callback) {
  var oldUserId = Meteor.userId();
  var oldLoginToken = Accounts._storedLoginToken();

  Meteor[service]( options, function (error) {
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
