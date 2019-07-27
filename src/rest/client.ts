import {
  Client,
  ClientOptions,
  Types as Options,
} from 'detritus-client-rest';

import { ShardClient } from '../client';
import { anyToCamelCase } from '../utils';

import { BaseCollection } from '../collections/basecollection';

import {
  Application,
  ApplicationNews,
  AuditLog,
  Channel,
  ChannelDM,
  ConnectedAccount,
  createChannelFromData,
  Emoji,
  Gift,
  Guild,
  Integration,
  Invite,
  Member,
  Message,
  PremiumSubscription,
  Profile,
  Reaction,
  Role,
  Team,
  TeamMember,
  User,
  UserMe,
  UserWithFlags,
  UserWithToken,
  VoiceRegion,
  Webhook,
} from '../structures';

import * as Types from './types';


export class RestClient extends Client {
  readonly client: ShardClient;

  constructor(
    token: string,
    options: ClientOptions,
    client: ShardClient,
  ) {
    super(token, options);

    this.client = client;
    Object.defineProperty(this, 'client', {
      enumerable: false,
      writable: false,
    });
  }

  async createChannelInvite(
    channelId: string,
    options: Options.CreateChannelInvite,
  ): Promise<null> {
    const data = super.createChannelInvite.call(this, channelId, options);
    return data;
  }

  async editChannelOverwrite(
    channelId: string,
    overwriteId: string,
    options: Options.EditChannelOverwrite = {},
  ): Promise<any> {
    return super.editChannelOverwrite.call(this, channelId, overwriteId, options);
  }

  async createDm(
    options: Options.CreateDm,
  ): Promise<ChannelDM> {
    const data = await super.createDm.call(this, options);
    let channel: ChannelDM;
    if (this.client.channels.has(data.id)) {
      channel = <ChannelDM> this.client.channels.get(data.id);
      channel.merge(data);
      // this should never happen lmao
    } else {
      channel = <ChannelDM> createChannelFromData(this.client, data);
      this.client.channels.insert(channel);
    }
    return channel;
  }

  async createGuild(
    options: Options.CreateGuild,
  ): Promise<Guild> {
    const data = await super.createGuild.call(this, options);
    let guild: Guild;
    if (this.client.guilds.has(data.id)) {
      guild = <Guild> this.client.guilds.get(data.id);
      guild.merge(data);
    } else {
      guild = <Guild> new Guild(this.client, data);
      this.client.guilds.insert(guild);
    }
    return guild;
  }

  async createGuildChannel(
    guildId: string,
    options: Options.CreateGuildChannel,
  ): Promise<Channel> {
    const data = await super.createGuildChannel.call(this, guildId, options);
    let channel: Channel;
    if (this.client.channels.has(data.id)) {
      channel = <Channel> this.client.channels.get(data.id);
      channel.merge(data);
      // this should never happen lmao
    } else {
      channel = createChannelFromData(this.client, data);
      this.client.channels.insert(channel);
    }
    return channel;
  }

  async createGuildEmoji(
    guildId: string,
    options: Options.CreateGuildEmoji,
  ): Promise<Emoji> {
    const data = await super.createGuildEmoji.call(this, guildId, options);
    let emoji: Emoji;
    if (this.client.emojis.has(data.id)) {
      emoji = <Emoji> this.client.emojis.get(data.id);
      emoji.merge(data);
    } else {
      data.guild_id = guildId;
      emoji = new Emoji(this.client, data);
      this.client.emojis.insert(emoji);
    }
    return emoji;
  }

  async createGuildRole(
    guildId: string,
    options: Options.CreateGuildRole,
  ): Promise<Role> {
    const data = await super.createGuildRole.call(this, guildId, options);
    data.guild_id = guildId;
    const role = new Role(this.client, data);
    if (this.client.guilds.has(guildId)) {
      (<Guild> this.client.guilds.get(guildId)).roles.set(role.id, role);
    }
    return role;
  }

  async createMessage(
    channelId: string,
    options: Options.CreateMessage,
  ): Promise<any> {
    const data = await super.createMessage.call(this, channelId, options);
    if (this.client.channels.has(data.channel_id)) {
      const channel = <Channel> this.client.channels.get(data.channel_id);
      if (channel.guildId) {
        data.guild_id = channel.guildId;
      }
    }
    const message = new Message(this.client, data);
    this.client.messages.insert(message);
    return data;
  }

  async createWebhook(
    channelId: string,
    options: Options.CreateWebhook,
  ): Promise<Webhook> {
    const data = await super.createWebhook.call(this, channelId, options);
    return new Webhook(this.client, data);
  }

  async deleteChannel(channelId: string): Promise<Channel> {
    const data = await super.deleteChannel.call(this, channelId);
    let channel: Channel;
    if (this.client.channels.has(data.id)) {
      channel = <Channel> this.client.channels.get(data.id);
      this.client.channels.delete(data.id);
      channel.merge(data);
    } else {
      channel = createChannelFromData(this.client, data);
    }
    return channel;
  }

  async deleteInvite(code: string): Promise<Invite> {
    const data = await super.deleteInvite.call(this, code);
    return new Invite(this.client, data);
  }

  /* Issue with merging data with these edited objects is that the gateway event wont have differences then */
  async editChannel(
    channelId: string,
    options: Options.EditChannel,
  ): Promise<Channel> {
    const data = await super.editChannel.call(this, channelId, options);
    let channel: Channel;
    if (this.client.channels.has(data.id)) {
      channel = <Channel> this.client.channels.get(data.id);
      channel.merge(data);
    } else {
      channel = createChannelFromData(this.client, data);
      // insert? nah
    }
    return channel;
  }

  async editGuild(
    guildId: string,
    options: Options.EditGuild,
  ): Promise<Guild> {
    const data = await super.editGuild.call(this, guildId, options);
    let guild: Guild;
    if (this.client.guilds.has(data.id)) {
      guild = <Guild> this.client.guilds.get(data.id);
      guild.merge(data);
    } else {
      guild = new Guild(this.client, data);
    }
    return guild;
  }

  async editGuildEmoji(
    guildId: string,
    emojiId: string,
    options: Options.EditGuildEmoji,
  ): Promise<Emoji> {
    const data = await super.editGuildEmoji.call(this, guildId, emojiId, options);
    let emoji: Emoji;
    if (this.client.emojis.has(data.id)) {
      emoji = <Emoji> this.client.emojis.get(data.id);
      emoji.merge(data);
    } else {
      data.guild_id = guildId;
      emoji = new Emoji(this.client, data);
    }
    return emoji;
  }

  async editGuildRole(
    guildId: string,
    roleId: string,
    options: Options.EditGuildRole,
  ): Promise<Role> {
    const data = await super.editGuildRole.call(this, guildId, roleId, options);
    let role: Role;
    if (this.client.guilds.has(guildId)) {
      const guild = <Guild> this.client.guilds.get(guildId);
      if (guild.roles.has(data.id)) {
        role = <Role> guild.roles.get(data.id);
        role.merge(data);
      } else {
        data.guild_id = guildId;
        role = new Role(this.client, data);
        guild.roles.set(role.id, role);
      }
    } else {
      data.guild_id = guildId;
      role = new Role(this.client, data);
    }
    return role;
  }

  async editGuildRolePositions(
    guildId: string,
    options: Options.EditGuildRolePositions,
  ): Promise<BaseCollection<string, Role>> {
    const data = await super.editGuildRolePositions.call(this, guildId, options);

    const collection = new BaseCollection<string, Role>();
    if (this.client.guilds.has(guildId)) {
      const guild = <Guild> this.client.guilds.get(guildId);
      guild.roles.clear();
      for (let raw of data) {
        raw.guild_id = guildId;
        const role = new Role(this.client, raw);
        guild.roles.set(role.id, role);
        collection.set(role.id, role);
      }
    } else {
      for (let raw of data) {
        raw.guild_id = guildId;
        const role = new Role(this.client, raw);
        collection.set(role.id, role);
      }
    }
    return collection;
  }

  async editMe(
    options: Options.EditMe,
  ): Promise<UserMe> {
    const data = await super.editMe.call(this, options);
    let user: UserMe;
    if (this.client.user !== null) {
      user = <UserMe> this.client.user;
      user.merge(data);
    } else {
      user = new UserMe(this.client, data);
    }
    return user;
  }

  async editMessage(
    channelId: string,
    messageId: string,
    options: Options.EditMessage,
  ): Promise<Message> {
    const data = await super.editMessage.call(this, channelId, messageId, options);
    let message: Message;
    if (this.client.messages.has(data.id)) {
      message = <Message> this.client.messages.get(data.id);
      message.merge(data);
    } else {
      message = new Message(this.client, data);
      // should we really merge? the message_update event wont have differences then
      this.client.messages.insert(message);
    }
    return message;
  }

  async editTeam(
    teamId: string,
    options: Options.EditTeam = {},
  ): Promise<any> {
    return super.editTeam.call(this, teamId, options);
  }

  async editUser(options: Options.EditMe) {
    return this.editMe(options);
  }

  async editWebhook(
    webhookId: string,
    options: Options.EditWebhook,
  ): Promise<Webhook> {
    const data = await super.editWebhook.call(this, webhookId, options);
    return new Webhook(this.client, data);
  }

  async editWebhookToken(
    webhookId: string,
    token: string,
    options: Options.EditWebhook,
  ): Promise<Webhook> {
    const data = await super.editWebhookToken.call(this, webhookId, token, options);
    return new Webhook(this.client, data);
  }

  async executeWebhook(
    webhookId: string,
    token: string,
    options: Options.ExecuteWebhook = {},
    compatibleType?: string,
  ): Promise<Message | null> {
    const data = await super.executeWebhook.call(this, webhookId, token, options, compatibleType);
    if (options.wait) {
      const message = new Message(this.client, data);
      this.client.messages.insert(message);
      return message;
    }
    return data;
  }

  async fetchApplicationNews(
    applicationIds?: Array<string> | string,
  ): Promise<BaseCollection<string, ApplicationNews>> {
    const data = await super.fetchApplicationNews.call(this, applicationIds);
    const collection = new BaseCollection<string, ApplicationNews>();
    for (let raw of data) {
      const applicationNews = new ApplicationNews(this.client, raw);
      collection.set(applicationNews.id, applicationNews);
    }
    return collection;
  }

  async fetchApplicationNewsId(newsId: string): Promise<ApplicationNews> {
    const data = await super.fetchApplicationNewsId.call(this, newsId);
    return new ApplicationNews(this.client, data);
  }

  async fetchApplications(): Promise<BaseCollection<string, Application>> {
    const data = await super.fetchApplications.call(this);
    const collection = new BaseCollection<string, Application>();
    for (let raw of data) {
      const application = new Application(this.client, raw);
      collection.set(application.id, application);
    }
    return collection;
  }

  async fetchChannelInvites(
    channelId: string,
  ): Promise<BaseCollection<string, Invite>> {
    const data: Array<any> = await super.fetchChannelInvites.call(this, channelId);
    const collection = new BaseCollection<string, Invite>();
    for (let raw of data) {
      const invite = new Invite(this.client, raw);
      collection.set(invite.code, invite);
    }
    return collection;
  }

  async fetchChannelWebhooks(
    channelId: string,
  ): Promise<BaseCollection<string, Webhook>> {
    const data = await super.fetchChannelWebhooks.call(this, channelId);
    const collection = new BaseCollection<string, Webhook>();
    for (let raw of data) {
      const webhook = new Webhook(this.client, raw);
      collection.set(webhook.id, webhook);
    }
    return collection;
  }

  async fetchDms(
    userId: string = '@me',
  ): Promise<BaseCollection<string, ChannelDM>> {
    const data: Array<any> = await super.fetchDms.call(this, userId);
    const collection = new BaseCollection<string, ChannelDM>();
    for (let raw of data) {
      let channel: ChannelDM;
      if (this.client.channels.has(raw.id)) {
        channel = <ChannelDM> this.client.channels.get(raw.id);
        channel.merge(raw);
      } else {
        channel = createChannelFromData(this.client, raw);
        this.client.channels.insert(channel);
      }
      collection.set(channel.id, channel);
    }
    return collection;
  }

  async fetchGiftCode(
    code: string,
    options: Options.FetchGiftCode,
  ): Promise<Gift> {
    const data = await super.fetchGiftCode.call(this, code, options);
    return new Gift(this.client, data);
  }

  async fetchGuild(guildId: string): Promise<Guild> {
    const data = await super.fetchGuild.call(this, guildId);
    let guild: Guild;
    if (this.client.guilds.has(data.id)) {
      guild = <Guild> this.client.guilds.get(data.id);
      guild.merge(data);
    } else {
      guild = new Guild(this.client, data);
    }
    return guild;
  }

  async fetchGuilds(): Promise<BaseCollection<string, Guild>> {
    const data: Array<any> = await super.fetchGuilds.call(this);
    const collection = new BaseCollection<string, Guild>();
    for (let raw of data) {
      let guild: Guild;
      if (this.client.guilds.has(raw.id)) {
        guild = <Guild> this.client.guilds.get(raw.id);
        guild.merge(raw);
      } else {
        guild = new Guild(this.client, raw);
      }
      collection.set(guild.id, guild);
    }
    return collection;
  }

  async fetchGuildAuditLogs(
    guildId: string,
    options: Options.FetchGuildAuditLogs,
  ): Promise<BaseCollection<string, AuditLog>> {
    const data = await super.fetchGuildAuditLogs.call(this, guildId, options);
    const collection = new BaseCollection<string, AuditLog>();
    for (let raw of data.audit_log_entries) {
      let target: null | User | Webhook = null;
      if (this.client.users.has(raw.target_id)) {
        target = <User> this.client.users.get(raw.target_id);
        // target.merge(data.users.find((user) => user.id === raw.target_id));
      } else {
        let rawTarget = data.users.find((user: any) => user.id === raw.target_id);
        if (rawTarget !== undefined) {
          target = new User(this.client, rawTarget);
        } else {
          rawTarget = data.webhooks.find((webhook: any) => webhook.id === raw.target_id);
          if (rawTarget !== undefined) {
            target = new Webhook(this.client, rawTarget);
          }
        }
      }

      let user: null | User = null;
      if (this.client.users.has(raw.user_id)) {
        user = <User> this.client.users.get(raw.user_id);
      } else {
        const rawUser = data.users.find((u: any) => u.id === raw.user_id);
        if (rawUser !== undefined) {
          user = new User(this.client, rawUser);
        }
      }

      raw.guild_id = guildId;
      raw.target = target;
      raw.user = user;
      const auditLog = new AuditLog(this.client, raw);
      collection.set(auditLog.id, auditLog);
    }
    return collection;
  }

  async fetchGuildBans(
    guildId: string,
  ): Promise<Types.fetchGuildBans> {
    const data = await super.fetchGuildBans.call(this, guildId);
    const collection: Types.fetchGuildBans = new BaseCollection();
    for (let raw of data) {
      let user: User;
      if (this.client.users.has(raw.id)) {
        user = <User> this.client.users.get(raw.id);
        user.merge(raw);
      } else {
        user = new User(this.client, raw);
      }
      collection.set(user.id, {
        reason: raw.reason,
        user,
      });
    }
    return collection;
  }

  async fetchGuildEmoji(
    guildId: string,
    emojiId: string,
  ): Promise<Emoji> {
    const data = await super.fetchGuildEmoji.call(this, guildId, emojiId);
    let emoji: Emoji;
    if (this.client.emojis.has(data.id)) {
      emoji = <Emoji> this.client.emojis.get(data.id);
      emoji.merge(data);
    } else {
      data.guild_id = guildId;
      emoji = new Emoji(this.client, data);
    }
    return emoji;
  }

  async fetchGuildEmojis(
    guildId: string,
  ): Promise<BaseCollection<string, Emoji>> {
    const data = await super.fetchGuildEmojis.call(this, guildId);
    const collection = new BaseCollection<string, Emoji>();

    if (this.client.guilds.has(guildId)) {
      const guild = <Guild> this.client.guilds.get(guildId);
      for (let [emojiId, emoji] of guild.emojis) {
        if (!data.some((e: any) => e.id === emojiId)) {
          this.client.emojis.delete(emojiId);
        }
      }
    }
    for (let raw of data) {
      let emoji: Emoji;
      if (this.client.emojis.has(raw.id)) {
        emoji = <Emoji> this.client.emojis.get(raw.id);
        emoji.merge(raw);
      } else {
        raw.guild_id = guildId;
        emoji = new Emoji(this.client, raw);
        this.client.emojis.insert(emoji);
      }
      collection.set(emoji.id, emoji);
    }
    return collection;
  }

  async fetchGuildIntegrations(
    guildId: string,
  ): Promise<BaseCollection<string, Integration>> {
    const data = await super.fetchGuildIntegrations.call(this, guildId);
    const collection = new BaseCollection<string, Integration>();
    for (let raw of data) {
      raw.guild_id = guildId;
      const integration = new Integration(this.client, raw);
      collection.set(integration.id, integration);
    }
    return collection;
  }

  async fetchGuildInvites(
    guildId: string,
  ): Promise<BaseCollection<string, Invite>> {
    const data = await super.fetchGuildInvites.call(this, guildId);
    const collection = new BaseCollection<string, Invite>();
    for (let raw of data) {
      const invite = new Invite(this.client, raw);
      collection.set(invite.code, invite);
    }
    return collection;
  }

  async fetchGuildMember(
    guildId: string,
    userId: string,
  ): Promise<Member> {
    const data = await super.fetchGuildMember.call(this, guildId, userId);
    let member: Member;
    if (this.client.members.has(guildId, userId)) {
      member = <Member> this.client.members.get(guildId, userId);
      member.merge(data);
    } else {
      data.guild_id = guildId;
      member = new Member(this.client, data);
    }
    return member;
  }

  async fetchGuildMembers(
    guildId: string,
    options: Options.FetchGuildMembers,
  ): Promise<BaseCollection<string, Member>> {
    const data = await super.fetchGuildMembers.call(this, guildId, options);

    this.client.members.delete(guildId);
    const collection = new BaseCollection<string, Member>();
    for (let raw of data) {
      raw.guild_id = guildId;
      const member = new Member(this.client, raw);
      this.client.members.insert(member);
      collection.set(member.id, member);
    }
    return collection;
  }

  async fetchGuildPremiumSubscriptions(
    guildId: string,
  ): Promise<BaseCollection<string, PremiumSubscription>> {
    const data = await super.fetchGuildPremiumSubscriptions.call(this, guildId);
    const subscriptions = new BaseCollection<string, PremiumSubscription>();
    for (let raw of data) {
      const subscription = new PremiumSubscription(this.client, raw);
      subscriptions.set(subscription.id, subscription);
    }
    return subscriptions;
  }

  async fetchGuildRoles(
    guildId: string,
  ): Promise<BaseCollection<string, Role>> {
    const data = await super.fetchGuildRoles.call(this, guildId);

    const collection = new BaseCollection<string, Role>();
    if (this.client.guilds.has(guildId)) {
      const guild = <Guild> this.client.guilds.get(guildId);
      guild.roles.clear();
      for (let raw of data) {
        raw.guild_id = guildId;
        const role = new Role(this.client, raw);
        guild.roles.set(role.id, role);
        collection.set(role.id, role);
      }
    } else {
      for (let raw of data) {
        raw.guild_id = guildId;
        const role = new Role(this.client, raw);
        collection.set(role.id, role);
      }
    }
    return collection;
  }

  async fetchGuildWebhooks(
    guildId: string,
  ): Promise<BaseCollection<string, Webhook>> {
    const data = await super.fetchGuildWebhooks.call(this, guildId);
    const collection = new BaseCollection<string, Webhook>();
    for (let raw of data) {
      const webhook = new Webhook(this.client, raw);
      collection.set(webhook.id, webhook);
    }
    return collection;
  }

  async fetchInvite(
    code: string,
    options: Options.FetchInvite
  ): Promise<Invite> {
    const data = await super.fetchInvite.call(this, code, options);
    return new Invite(this.client, data);
  }

  async fetchMeConnections(): Promise<BaseCollection<string, ConnectedAccount>> {
    const data = await super.fetchMeConnections.call(this);
    const collection = new BaseCollection<string, ConnectedAccount>();
    for (let raw of data) {
      const connectedAccount = new ConnectedAccount(this.client, raw);
      collection.set(connectedAccount.id, connectedAccount);
    }
    return collection;
  }

  async fetchMessage(
    channelId: string,
    messageId: string,
  ): Promise<Message> {
    const data = await super.fetchMessage.call(this, channelId, messageId);

    let message: Message;
    if (this.client.messages.has(data.id)) {
      message = <Message> this.client.messages.get(data.id);
      message.merge(data);
    } else {
      if (this.client.channels.has(data.channel_id)) {
        const channel = <Channel> this.client.channels.get(data.channel_id);
        data.guild_id = channel.guildId;
      }
      message = new Message(this.client, data);
    }
    return message;
  }

  async fetchMessages(
    channelId: string,
    options: Options.FetchMessages,
  ): Promise<BaseCollection<string, Message>> {
    const data = await super.fetchMessages.call(this, channelId, options);

    let guildId: null | string = null;
    if (data.length) {
      const raw = data[0];
      if (this.client.channels.has(raw.channel_id)) {
        const channel = <Channel> this.client.channels.get(raw.channel_id);
        guildId = channel.guildId;
      }
    }

    const collection = new BaseCollection<string, Message>();
    for (let raw of data) {
      let message: Message;
      if (this.client.messages.has(raw.id)) {
        message = <Message> this.client.messages.get(raw.id);
        message.merge(raw);
      } else {
        raw.guild_id = guildId;
        message = new Message(this.client, raw);
      }
      collection.set(message.id, message);
    }
    return collection;
  }

  async fetchOauth2Application(
    userId: string = '@me',
  ): Promise<Types.fetchOauth2Application> {
    const data = anyToCamelCase(
      await super.fetchOauth2Application.call(this, userId),
      ['bot', 'owner', 'team'],
    );
    if (this.client.users.has(data.owner.id)) {
      // dont use the cache since this object has flags key, just update the cache
      (<User> this.client.users.get(data.owner.id)).merge(data.owner);
    }

    data.owner = new UserWithFlags(this.client, data.owner);
    if (userId === '@me') {
      this.client.owners.clear();
      this.client.owners.set(data.owner.id, data.owner);
      if (data.team !== null) {
        data.team = new Team(this.client, data.team);
        for (let [userId, member] of data.team.members) {
          this.client.owners.set(userId, member.user);
        }
      }
    } else {
      if (data.bot) {
        data.bot = new UserWithToken(this.client, data.bot);
      }
    }
    return data;
  }

  async fetchPinnedMessages(
    channelId: string,
  ): Promise<BaseCollection<string, Message>> {
    const data = await super.fetchMessages.call(this, channelId);

    let guildId: null | string = null;
    if (data.length) {
      const raw = data[0];
      if (this.client.channels.has(raw.channel_id)) {
        const channel = <Channel> this.client.channels.get(raw.channel_id);
        guildId = channel.guildId;
      }
    }

    const collection = new BaseCollection<string, Message>();
    for (let raw of data) {
      let message: Message;
      if (this.client.messages.has(raw.id)) {
        message = <Message> this.client.messages.get(raw.id);
        message.merge(raw);
      } else {
        raw.guild_id = guildId;
        message = new Message(this.client, raw);
      }
      collection.set(message.id, message);
    }
    return collection;
  }

  async fetchReactions(
    channelId: string,
    messageId: string,
    emoji: string,
    options: Options.FetchReactions = {},
  ): Promise<BaseCollection<string, User>> {
    const data = await super.fetchReactions.call(this, channelId, messageId, emoji, options);
    const collection = new BaseCollection<string, User>();
    for (let raw of data) {
      let user: User;
      if (this.client.users.has(raw.id)) {
        user = <User> this.client.users.get(raw.id);
        user.merge(raw);
      } else {
        user = new User(this.client, raw);
      }
      collection.set(user.id, user);
    }
    return collection;
  }

  async fetchTeam(teamId: string): Promise<Team> {
    const data = await super.fetchTeam.call(this, teamId);
    return new Team(this.client, data);
  }

  async fetchTeamMembers(teamId: string): Promise<BaseCollection<string, TeamMember>> {
    const data: Array<any> = await super.fetchTeamMembers.call(this, teamId);
    const collection = new BaseCollection<string, TeamMember>();
    for (let raw of data) {
      collection.set(raw.user.id, new TeamMember(this.client, raw));
    }
    return collection;
  }

  async fetchTeamMember(teamId: string, userId: string): Promise<TeamMember> {
    const data = await super.fetchTeamMember.call(this, teamId, userId);
    return new TeamMember(this.client, data);
  }

  async fetchUser(
    userId: string,
  ): Promise<User> {
    const data = await super.fetchUser.call(this, userId);
    let user: User;
    if (this.client.users.has(data.id)) {
      user = <User> this.client.users.get(data.id);
      user.merge(data);
    } else {
      user = new User(this.client, data);
    }
    return user;
  }

  async fetchUserProfile(userId: string): Promise<Profile> {
    const data = await super.fetchUserProfile.call(this, userId);
    return new Profile(this.client, data);
  }

  async fetchVoiceRegions(
    guildId?: string,
  ): Promise<BaseCollection<string, VoiceRegion>> {
    const data = await super.fetchVoiceRegions.call(this, guildId);
    const regions = new BaseCollection<string, VoiceRegion>();
    for (let raw of data) {
      const region = new VoiceRegion(this.client, raw);
      regions.set(region.id, region);
    }
    return regions;
  }

  async fetchWebhook(
    webhookId: string,
  ): Promise<Webhook> {
    const data = await super.fetchWebhook.call(this, webhookId);
    return new Webhook(this.client, data);
  }

  async fetchWebhookToken(
    webhookId: string,
    token: string,
  ): Promise<Webhook> {
    const data = await super.fetchWebhookToken.call(this, webhookId, token);
    return new Webhook(this.client, data);
  }
}
