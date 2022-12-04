/*
* Utilities Module
*/
const database = require('./database')

/*
* Returns an array of the most popular projects
*/
exports.getMostPopularProjects = (arr, count = undefined) => {
  // Make a copy of the array to sort
  let sortedArray = arr

  // Sort array from highest to lowest values
  sortedArray.sort((a, b) => a.collaborators.length < b.collaborators.length ? 1 : a.collaborators.length > b.collaborators.length ? -1 : 0)

  if (count !== undefined) {
    // Return an array of the number of the highest values requested
    return sortedArray.slice(0, count - 1)
  } else {
    return sortedArray
  }
}

/*
 * Returns an array of the latest projects, users, or guilds (in order of creation date)
 */
exports.getLatest = (arr, count = undefined) => {
  // Make a copy of the array to sort
  let sortedArray = arr

  // Sort array from the latest date to oldest
  sortedArray.sort((a, b) => a.created_on < b.created_on ? 1 : a.created_on > b.created_on ? -1 : 0)

  if (count !== undefined) {
    // Return an array of the number of the latest objects requested
    return sortedArray.slice(0, count - 1)
  } else {
    // Return an array of all objects in order of creation.
    return sortedArray
  }
}

/*
 * Returns whether the user an owner of the project/guild
 */
exports.isUserOwner = (object, userObject) => {
  let isOwner = false

  if (userObject !== undefined) {
    // Check if the user is one of the owners
    for (let owner of object.owners) {
      if (String(owner._id) === String(userObject._id)) {
        isOwner = true
        break
      }
    }
  }

  return isOwner
}


/*
 * Returns whether the user a collaborator of the project
 */
exports.isUserProjectCollaborator = (projectObject, userObject) => {
  let isCollaborator = false

  if (userObject !== undefined) {
    // Check if the user is one of the collaborators
    for (let collaborator of projectObject.collaborators) {
      if (String(collaborator._id) === String(userObject._id)) {
        isCollaborator = true
        break
      }
    }
  }

  return isCollaborator
}

/*
 * Returns whether the user a member of the guild
 */
exports.isUserGuildMember = (guildObject, userObject) => {
  let isMember = false

  if (userObject !== undefined) {
    // Check if the user is one of the members
    for (let member of guildObject.members) {
      if (String(member._id) === String(userObject._id)) {
        isMember = true
        break
      }
    }
  }

  return isMember
}

/*
 * Returns whether the user is an owner or collaborator of the project
 */
exports.isUserInvolvedWithProject = (projectObject, userObject) => {
  return !!(this.isUserOwner(projectObject, userObject) || this.isUserProjectCollaborator(projectObject, userObject));
}

/*
* Get all projects that the user has participated in
*/
exports.getInvolvedProjects = (userObject) => {
  return database.getProjectsByOwner(userObject).then((ownedProjects) => {
    return database.getProjectsByCollaborator(userObject).then((collabProjects) => {
      return [...ownedProjects, ...collabProjects]
    })
  })
}

/*
 * Returns whether the user is an owner or member of the guild
 */
exports.isUserInvolvedWithGuild = (guildObject, userObject) => {
  return !!(this.isUserOwner(guildObject, userObject) || this.isUserGuildMember(guildObject, userObject));
}

/*
* Get all guilds that the user is involved in
*/
exports.getInvolvedGuilds = (userObject) => {
  return database.getGuildsByOwner(userObject).then((ownedGuilds) => {
    return database.getGuildsByMember(userObject).then((memberGuilds) => {
      return [...ownedGuilds, ...memberGuilds]
    })
  })
}