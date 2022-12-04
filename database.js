const mongoose = require('mongoose')
const { SchemaTypes } = require('mongoose')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema

// --- Schemas ---
const userSchema = new Schema({
  first_name: String,
  last_name: String,
  username: String,
  email: String,
  password: String,
  skill: String,
  bio: String,
  profile_header: String,
  extended_bio: String,
  icon_url: String,
  social_links: [{ site: String, url: String }],
  contact_email: String,
  show_contact_email: Boolean,
  contact_schedule: String,
  created_on: Date,
  login_history: [{timestamp: Date, userAgent: String}]
})

const projectSchema = new Schema({
  name: String,
  slug: String,
  description: String,
  description_short: String,
  created_on: Date,
  website: String,
  category: String,
  email: String,
  logo_url: String,
  banner_url: String,
  image_url: String,
  socials: [{ site: String, url: String }],
  reviews: [{ author: {type: SchemaTypes.ObjectID, ref: 'guildcoder_users'}, content: String }],
  owners: [ {type: SchemaTypes.ObjectID, ref: 'guildcoder_users'} ],
  collaborators: [ {type: SchemaTypes.ObjectID, ref: 'guildcoder_users'} ]
})

const guildSchema = new Schema({
  name: String,
  slug: String,
  description: String,
  description_short: String,
  website: String,
  contact_email: String,
  image_url: String,
  owners: [ {type: SchemaTypes.ObjectID, ref: 'guildcoder_users'} ],
  members: [ {type: SchemaTypes.ObjectID, ref: 'guildcoder_users'} ],
  projects: [ {type: SchemaTypes.ObjectID, ref: 'guildcoder_projects'} ],
  messages: [{author: {type: SchemaTypes.ObjectID, ref: 'guildcoder_users'}, message: String, sent_on: Date, edited: Boolean}],
  created_on: Date
})

const conversationSchema = new Schema({
  name: String,
  participants: [ {type: SchemaTypes.ObjectID, ref: 'guildcoder_users'} ],
  messages: [{author: {type: SchemaTypes.ObjectID, ref: 'guildcoder_users'}, message: String, sent_on: Date, edited: Boolean}],
  created_on: Date
})

// --- Models ---
const User = mongoose.model('guildcoder_users', userSchema)
const Project = mongoose.model('guildcoder_projects', projectSchema)
const Guild = mongoose.model('guildcoder_guilds', guildSchema)
const Conversation = mongoose.model('guildcoder_conversations', conversationSchema)

// --- Functions ---

exports.connectToDB = (connectionString) => {
  mongoose.connect(connectionString)
}

// -- User-Related Functions --

/*
 * Creates a new user with the given information.
*/
exports.createUser = (firstName, lastName, u_username, u_email, u_password, u_skill) => {
  // Encrypt the password using bcrypt and save user
  return bcrypt.genSalt(10).then((Salt) => {
    return bcrypt.hash(u_password, Salt).then((hash) => {
      // Create a user object
      const newUser = new User({
        first_name: firstName,
        last_name: lastName,
        username: u_username,
        email: u_email,
        password: hash,
        skill: u_skill,
        bio: 'Hi! 👋 ',
        profile_header: 'Welcome to my profile!',
        extended_bio: 'Here are some of my projects. Check them out!',
        icon_url: '/images/default-user-icon.png',
        social_links: [],
        contact_email: u_email,
        show_contact_email: false,
        contact_schedule: 'Send me a message. I will try to get back to you quickly.',
        created_on: new Date(),
      })

      // Commit it to the database
      return newUser.save().then((user) => {
        process.stdout.write(`Successfully added new user ${user.username}\n`)
        return user
      }).catch((reason) => {
        process.stdout.write(`ERROR (when saving new user): ${reason}\n`)
        return false
      })
    }).catch((err) => {
      // Issue creating hashed password
      process.stdout.write(`ERROR (while hashing password): ${err}`)
      return false
    })
  }).catch((err) => {
    // Issue creating hashed object salt
    process.stdout.write(`ERROR (while generating password salt): ${err}`)
    return false
  })
}

/*
 * Gets the user with the provided id.
*/
exports.getUserById = (u_Id) => {
  // Fetch information about the user with the given id
  return User.findOne({ _id: u_Id }).exec().then((user) => {
    // User found.
    return user
  }).catch((reason) => {
    // No user found with this id.
    console.log(reason)
    return false
  })
}

/*
 * Gets the users with the provided ids.
*/
exports.getUsersById = (u_Ids) => {
  // Fetch information about the users with the given ids
  return User.find({ _id: u_Ids }).exec().then((users) => {
    // User found.
    return users
  }).catch((reason) => {
    // No users found with these ids.
    console.log(reason)
    return false
  })
}

/*
 * Gets the user with the provided email.
*/
exports.getUserByEmail = (u_email) => {
  // Fetch information about the user with the given email
  return User.findOne({ email: u_email }).exec().then((user) => {
    // User found.
    return user
  }).catch((reason) => {
    // No user found with this email.
    console.log(reason)
    return false
  })
}


/*
 * Gets the user with the provided username.
*/
exports.getUserByUsername = (u_username) => {
  // Fetch information about the user with the given username
  return User.findOne({ username: u_username }).exec().then((user) => {
    // User found.
    return user
  }).catch((reason) => {
    console.log(reason)
    // No user found with this username.
    return false
  })
}

/*
 * Gets an array of all existing users.
*/
exports.getAllUsers = () => {
  // Fetch an array of all users
  return User.find({ }).exec().then((users) => {
    // Users found.
    return users
  }).catch((reason) => {
    console.log(reason)
    // Error retrieving users.
    return false
  })
}

/*
 * Checks if the corresponding password matches that of the provided email.
*/
exports.authUser = (u_email, u_password) => {
  // Fetch information about the user with the given email
  return User.findOne({ email: u_email }).exec().then((user) => {
    // User found. Check password.
    return bcrypt.compare(u_password, user.password).then((isMatch) => {
      // Check if it is a match
      return [isMatch, isMatch ? user : undefined]
    })
  }).catch((reason) => {
    console.log(reason)
    // No user found with this email.
    return [false]
  })
}

/*
 * Updates the user with the given email address.
*/
exports.updateUser = (u_email, object) => {
  return bcrypt.genSalt(10).then((Salt) => {
    return bcrypt.hash(object.password, Salt).then((hash) => {
      if (object.password.length > 0) {
        object.password = hash;
      } else {
        object.password = object.old_password
      }
      delete object.old_password

      // Update User
      return User.updateOne(
        { email: u_email },
        { $set: object }
      ).exec().then(() => {
        // Updated user successfully
        return true
      }).catch((reason) => {
        // Failed to update the user
        process.stdout.write(`ERROR (while updating user): ${reason}\n`)
        return false
      })
    }).catch((err) => {
      // Issue creating hashed password
      process.stdout.write(`ERROR (while hashing password): ${err}`)
      return false
    })
  }).catch((err) => {
    // Issue creating hashed object salt
    process.stdout.write(`ERROR (while generating password salt): ${err}`)
    return false
  })


}

// -- Project-Related Functions --

/*
 * Creates a new project with the given information.
*/
exports.createProject = (p_name, p_slug, p_description, p_description_short, p_website, p_category, p_email, p_owners) => {
  // Create a project object
  const newProject = new Project({
    name: p_name,
    slug: p_slug,
    description: p_description,
    description_short: p_description_short,
    created_on: new Date(),
    website: p_website,
    category: p_category,
    email: p_email,
    logo_url: 'https://via.placeholder.com/100x100',
    banner_url: 'https://via.placeholder.com/2300x500',
    image_url: 'https://via.placeholder.com/400x300',
    socials: [],
    reviews: [],
    owners: p_owners,
    collaborators: []
  })

  // Commit it to the database
  return newProject.save().then((project) => {
    process.stdout.write(`Successfully added new project ${project.name}\n`)
    return project
  }).catch((reason) => {
    process.stdout.write(`ERROR (when saving new project): ${reason}\n`)
    return false
  })
}

/*
 * Gets the project with the provided slug.
*/
exports.getProjectBySlug = (p_slug) => {
  // Fetch information about the project with the given slug
  return Project.findOne({ slug: p_slug }).populate('owners').populate('collaborators').populate('reviews.author').exec().then((project) => {
    // Project found.
    return project
  }).catch((reason) => {
    console.log(reason)
    // No project found with this slug.
    return false
  })
}

/*
 * Gets the projects that have the provided user as the owner.
*/
exports.getProjectsByOwner = (owner) => {
  // Fetch information about the projects with the given owner
  return Project.find({ owners: owner }).populate('owners').populate('collaborators').populate('reviews.author').exec().then((projects) => {
    // Projects found.
    return projects
  }).catch(() => {
    // No projects found with this owner.
    return false
  })
}

/*
 * Gets the projects that have the provided user as a collaborator.
*/
exports.getProjectsByCollaborator = (collaborator) => {
  // Fetch information about the projects with the given owner
  return Project.find({ collaborators: collaborator }).populate('owners').populate('collaborators').populate('reviews.author').exec().then((projects) => {
    // Projects found.
    return projects
  }).catch(() => {
    // No projects found with this collaborator.
    return false
  })
}

/*
 * Gets an array of all existing projects.
*/
exports.getAllProjects = () => {
  // Fetch an array of all users
  return Project.find({}).populate('owners').populate('collaborators').populate('reviews.author').exec().then((projects) => {
    // Projects found.
    return projects
  }).catch((reason) => {
    console.log(reason)
    // Error retrieving projects.
    return false
  })
}

/*
 * Updates the project with the given slug.
*/
exports.updateProject = (p_slug, object) => {
  return Project.updateOne(
    { slug: p_slug },
    { $set: object }
  ).exec().then(() => {
    // Updated project successfully
    return true
  }).catch((reason) => {
    // Failed to update the project
    process.stdout.write(`ERROR (while updating project): ${reason}\n`)
    return false
  })
}

/*
 * Adds a review to the project.
 */
exports.addReview = (p_slug, reviewObject) => {
  return Project.updateOne(
    { slug: p_slug },
    {$push: {reviews: reviewObject}}
  ).exec().then(() => {
    // Added review successfully
    return true
  }).catch((reason) => {
    // Failed to add the review
    process.stdout.write(`ERROR (while adding review): ${reason}\n`)
    return false
  })
}

/*
 * Adds a collaborator to the project.
 */
exports.addCollaborator = (p_slug, userObject) => {
  return Project.updateOne(
    { slug: p_slug },
    {$push: {collaborators: userObject}}
  ).exec().then(() => {
    // Added collaborator successfully
    return true
  }).catch((reason) => {
    // Failed to add the collaborator
    process.stdout.write(`ERROR (while adding collaborator): ${reason}\n`)
    return false
  })
}

// -- Guild-Related Functions --
/*
 * Creates a new guild with the given information.
*/
exports.createGuild = (g_name, g_slug, g_description, g_description_short, g_website, g_email, g_owners) => {
  // Create a guild object
  const newGuild = new Guild({
    name: g_name,
    slug: g_slug,
    description: g_description,
    description_short: g_description_short,
    website: g_website,
    owners: g_owners,
    contact_email: g_email,
    image_url: "https://via.placeholder.com/400x300",
    members: [],
    projects: [],
    messages: [],
    created_on: new Date()
  })

  // Commit it to the database
  return newGuild.save().then((guild) => {
    process.stdout.write(`Successfully added new guild ${guild.name}\n`)
    return guild
  }).catch((reason) => {
    process.stdout.write(`ERROR (when saving new guild): ${reason}\n`)
    return false
  })
}

/*
 * Gets the guild with the provided slug.
*/
exports.getGuildBySlug = (g_slug) => {
  // Fetch information about the guild with the given slug
  return Guild.findOne({ slug: g_slug }).populate('owners').populate('members').populate('projects').populate('messages.author').exec().then((guild) => {
    // Guild found.
    return guild
  }).catch((reason) => {
    console.log(reason)
    // No guild found with this slug.
    return false
  })
}

/*
 * Gets the guilds that have the provided user as the owner.
*/
exports.getGuildsByOwner = (owner) => {
  // Fetch information about the guilds with the given owner
  return Guild.find({ owners: owner }).populate('owners').populate('members').populate('projects').populate('messages.author').exec().then((guilds) => {
    // Guilds found.
    return guilds
  }).catch(() => {
    // No guilds found with this owner.
    return false
  })
}

/*
 * Gets the guilds that have the provided user as a member.
*/
exports.getGuildsByMember = (member) => {
  // Fetch information about the guilds with the given member
  return Guild.find({ members: member }).populate('owners').populate('members').populate('projects').populate('messages.author').exec().then((guilds) => {
    // Guilds found.
    return guilds
  }).catch(() => {
    // No guilds found with this member.
    return false
  })
}

/*
 * Gets an array of all existing guilds.
*/
exports.getAllGuilds = () => {
  // Fetch an array of all guilds
  return Guild.find({}).populate('owners').populate('members').populate('projects').populate('messages.author').exec().then((guilds) => {
    // Guilds found.
    return guilds
  }).catch((reason) => {
    console.log(reason)
    // Error retrieving guilds.
    return false
  })
}

/*
 * Updates the guild with the given slug.
*/
exports.updateProject = (g_slug, object) => {
  return Guild.updateOne(
    { slug: g_slug },
    { $set: object }
  ).exec().then(() => {
    // Updated guild successfully
    return true
  }).catch((reason) => {
    // Failed to update the guild
    process.stdout.write(`ERROR (while updating guild): ${reason}\n`)
    return false
  })
}

/*
 * Adds a message to the guild.
 */
exports.addMessage = (g_slug, messageObject) => {
  return Guild.updateOne(
    { slug: g_slug },
    {$push: {messages: messageObject}}
  ).exec().then(() => {
    // Added message successfully
    return true
  }).catch((reason) => {
    // Failed to add the message
    process.stdout.write(`ERROR (while adding message): ${reason}\n`)
    return false
  })
}

/*
 * Adds a member to the guild.
 */
exports.addGuildMember = (g_slug, userObject) => {
  return Guild.updateOne(
    { slug: g_slug },
    {$push: {members: userObject}}
  ).exec().then(() => {
    // Added member successfully
    return true
  }).catch((reason) => {
    // Failed to add the member
    process.stdout.write(`ERROR (while adding member): ${reason}\n`)
    return false
  })
}

// -- Conversation-Related Functions --
/*
 * Creates a new conversation with the given information.
*/
exports.createConversation = (c_name, c_participants) => {
  // Create a conversation object
  const newConversation = new Conversation({
    name: c_name,
    participants: c_participants,
    messages: [],
    created_on: new Date()
  })

  // Commit it to the database
  return newConversation.save().then((conversation) => {
    process.stdout.write(`Successfully added new conversation ${conversation.name}\n`)
    return conversation
  }).catch((reason) => {
    process.stdout.write(`ERROR (when saving new conversation): ${reason}\n`)
    return false
  })
}

/*
 * Gets the conversation that has the provided id.
*/
exports.getConversationById = (id) => {
  // Fetch information about the conversation with the given id
  return Conversation.find({ _id: id }).populate('participants').populate('messages.author').exec().then((conversation) => {
    // Conversation found.
    console.log(conversation)
    console.log(conversation.messages)
    return conversation
  }).catch(() => {
    // No conversation found with this id.
    return false
  })
}

/*
 * Gets the conversations that have the provided user as a participant.
*/
exports.getConversationsByParticipant = (participant) => {
  // Fetch information about the conversations with the given participant
  return Conversation.find({ participants: participant }).populate('participants').populate('messages.author').exec().then((conversations) => {
    // Conversations found.
    return conversations
  }).catch(() => {
    // No conversations found with this participant.
    return false
  })
}

/*
 * Gets an array of all existing conversations.
*/
exports.getAllConversations = () => {
  // Fetch an array of all conversations
  return Conversation.find({}).populate('participants').populate('messages.author').exec().then((conversations) => {
    // Conversations found.
    return conversations
  }).catch((reason) => {
    console.log(reason)
    // Error retrieving conversations.
    return false
  })
}

/*
 * Updates the conversation with the given id.
*/
exports.updateConversation = (c_id, object) => {
  return Conversation.updateOne(
    { _id: c_id },
    { $set: object }
  ).exec().then(() => {
    // Updated conversation successfully
    return true
  }).catch((reason) => {
    // Failed to update the conversation
    process.stdout.write(`ERROR (while updating conversation): ${reason}\n`)
    return false
  })
}

/*
 * Adds a message to the conversation.
 */
exports.addConversationMessage = (c_id, messageObject) => {
  return Conversation.updateOne(
    { _id: c_id },
    {$push: {messages: messageObject}}
  ).exec().then(() => {
    // Added message successfully
    return true
  }).catch((reason) => {
    // Failed to add the message
    process.stdout.write(`ERROR (while adding message): ${reason}\n`)
    return false
  })
}

/*
 * Adds a member to the conversation.
 */
exports.addConversationParticipant = (c_id, userObject) => {
  return Conversation.updateOne(
    { _id: c_id },
    {$push: {participants: userObject}}
  ).exec().then(() => {
    // Added conversation participant successfully
    return true
  }).catch((reason) => {
    // Failed to add the member
    process.stdout.write(`ERROR (while adding conversation participant): ${reason}\n`)
    return false
  })
}
