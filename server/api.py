from __future__ import print_function
import httplib2
import os
import argparse

from OpenSSL import SSL
from flask import Flask, jsonify
from flask_restful import Resource, Api, reqparse
from flask.ext.mysql import MySQL
from apiclient import discovery
import oauth2client

from oauth2client import client
from oauth2client import tools

import db_info

app = Flask(__name__)
api = Api(app)

mysql = MySQL()
app.config['MYSQL_DATABASE_USER'] = db_info.db_user
app.config['MYSQL_DATABASE_PASSWORD'] =  db_info.db_pw
app.config['MYSQL_DATABASE_DB'] = db_info.db_name
app.config['MYSQL_DATABASE_HOST'] = db_info.db_host
app.config['MYSQL_USE_UNICODE'] = 'True'
mysql.init_app(app)
SCOPES = 'https://www.googleapis.com/auth/gmail.readonly'
CLIENT_SECRET_FILE = 'client_secret.json'
APPLICATION_NAME = 'Gmail API Python Quickstart'

class CreateUser(Resource):
    def post(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Gmail of user')
            args = parser.parse_args()

            _username = args['username']

            conn = mysql.connect()
            cursor = conn.cursor()
            cursor.callproc('createUser', args=[_username])
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                return { 'statuscode': '200', 'message': 'User creation success' }
            else:
                return { 'statuscode': '1000', 'message': str(data[0]) }

        except Exception as e:
            return { 'error': str(e) }

class AddTask(Resource):
    def post(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Owner of task')
            parser.add_argument('deadline', type=str, help='Complete by date')
            parser.add_argument('description', type=str, help='Detail of task')
            args = parser.parse_args()

            _username = args['username']
            _deadline = args['deadline']
            _description = args['description']

            conn = mysql.connect()
            cursor = conn.cursor()
            cursor.callproc('add_task', (_username, _deadline, _description))
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                return { 'statuscode': '200', 'message': 'Successfully added task' }
            else:
                return { 'statuscode': '1000', 'message': str(data[0]) }

        except Exception as e:
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Owner of task')
            parser.add_argument('deadline', type=str, help='Complete by date')
            parser.add_argument('description', type=str, help='Detail of task')
            args = parser.parse_args()
            return { 'error': str(e) }

class DeleteTask(Resource):
    def delete(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('taskid', type=int, help='Which task')
            args = parser.parse_args()

            _taskid = args['taskid']

            conn = mysql.connect()
            cursor = conn.cursor()
            cursor.callproc('delete_task', args=[_taskid])
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                return { 'statuscode': '200', 'message': 'Task deleted successfully' }
            else:
                return { 'statuscode': '1000', 'message': str(data[0]) }

        except Exception as e:
            return { 'error': str(e) }

class CheckTask(Resource):
    def post(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('taskid', type=int, help='Task ID')
            parser.add_argument('status', type=int, help='Task status')
            args = parser.parse_args()

            _taskid = args['taskid']
            _status = args['status']

            conn = mysql.connect()
            cursor = conn.cursor()
            cursor.callproc('check_task', (_taskid, _status))
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                return { 'statuscode': '200', 'message': 'Checked task' + str(_status) }
            else:
                return { 'statuscode': '1000', 'message': str(data[0]) }

        except Exception as e:
            return { 'error': str(e) }

class GetTask(Resource):
    def get(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Owner of tasks')
            args = parser.parse_args()

            _username = args['username']

            conn = mysql.connect()
            cursor = conn.cursor()
            cursor.callproc('get_all_tasks', args=[_username])
            data = cursor.fetchall()

            task_list = []
            none_list = []
            for task in data:
                if task[1] is None:
                    i = { 'taskid': task[0],
                          'deadline': 'none',
                          'description': task[2],
                          'status': task[3] }
                    none_list.append(i)
                else:
                    i = { 'taskid': task[0],
                          'deadline': str(task[1]),
                          'description': task[2],
                          'status': task[3] }
                    task_list.append(i)

            return task_list + none_list

        except Exception as e:
            return { 'error': str(e) }

class GetAListedSite(Resource):
    def get(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Owner of listedsite')
            parser.add_argument('domainName', type=str, help='Current domain of user')
            args = parser.parse_args()

            _username = args['username']
            _domainName = args['domainName']

            conn = mysql.connect()
            cursor = conn.cursor()
            cursor.callproc('getAListedSite', (_username, _domainName))
            data = cursor.fetchone()

            site = { 'owner': data[0],
                     'domainName': data[1],
                     'dailyTime': data[2],
                     'blockedTime': data[3],
                     'isBlocked': data[4],
                     'timeCap': data[5] }

            return site

        except Exception as e:
            return { 'error': str(e) }

# Note: This request ensures that the sent data is consistent with the database
# It will only update the server's dailyTime == client's dailyTime
class IncrementAListedSite(Resource):
    def post(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Owner of listedsite')
            parser.add_argument('domainName', type=str, help='Current domain of user')
            parser.add_argument('dailyTime', type=int, help='Time spent today')
            args = parser.parse_args()

            _username = args['username']
            _domainName = args['domainName']
            _dailyTime = args['dailyTime']

            conn = mysql.connect()

            cursor = conn.cursor()
            cursor.callproc('incrementAListedSite', (_username, _domainName, _dailyTime))
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                cursor.close()
            else:
                return { 'statuscode': '1000', 'message': str(data[0]) }

            # Needs a new cursor to execute another procedure
            cursor = conn.cursor()
            cursor.callproc('getAListedSite', (_username, _domainName))
            data = cursor.fetchone()

            site = { 'owner': data[0],
                     'domainName': data[1],
                     'dailyTime': data[2],
                     'blockedTime': data[3],
                     'isBlocked': data[4],
                     'timeCap': data[5] }

            return site

        except Exception as e:
            return { 'error': str(e) }

# Does a similar handshake like IncrementAListedSite()
class IncrementABlockedSite(Resource):
    def post(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Owner of listedsite')
            parser.add_argument('domainName', type=str, help='Current domain of user')
            parser.add_argument('dailyTime', type=int, help='Time spent today')
            parser.add_argument('blockedTime', type=int, help='Time spent today when blocking')
            args = parser.parse_args()

            _username = args['username']
            _domainName = args['domainName']
            _dailyTime = args['dailyTime']
            _blockedTime = args['blockedTime']

            conn = mysql.connect()

            cursor = conn.cursor()
            cursor.callproc('incrementABlockedSite', (_username, _domainName, _dailyTime, _blockedTime))
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                cursor.close()
            else:
                return { 'statuscode': '1000', 'message': str(data[0]) }

            cursor = conn.cursor()
            cursor.callproc('getAListedSite', (_username, _domainName))
            data = cursor.fetchone()

            site = { 'owner': data[0],
                     'domainName': data[1],
                     'dailyTime': data[2],
                     'blockedTime': data[3],
                     'isBlocked': data[4],
                     'timeCap': data[5] }

            return site

        except Exception as e:
            return { 'error': str(e) }

# Ignore _isBlocked, phpMyAdmin is being dumb
# IMPORTANT: This method is atomic, if createListedSite or createSiteTimeHistory fails
# then nothing will be committed
class AddListedSite(Resource):
    def post(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Owner of listedsite')
            parser.add_argument('domainName', type=str, help='Domain to block')
            parser.add_argument('timeCap', type=int, help='Time before block')
            args = parser.parse_args()

            _username = args['username']
            _domainName = args['domainName']
            _timeCap = args['timeCap']
            _isBlocked = 0

            if _timeCap is None:
                _timeCap = 0

            conn = mysql.connect()

            cursor = conn.cursor()
            cursor.callproc('createListedSite', (_username, _domainName, _isBlocked, _timeCap))
            data = cursor.fetchall()

            if len(data) is 0:
                cursor.close()
            else:
                return { 'statuscode': '1000', 'message': str(data[0]) }

            cursor = conn.cursor()
            cursor.callproc('createSiteTimeHistory', (_username, _domainName))
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                cursor.close()
                return { 'message': 'Successfully created ListedSite and SiteTimeHistory' }
            else:
                return { 'statuscode': '1000', 'message': str(data[0]) }

        except Exception as e:
            return { 'error': str(e), 'note': 'This method is atomic! Check ListedSite and SiteTimeHistory!'}

class EditListedSite(Resource):
    def post(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Owner of listedsite')
            parser.add_argument('domainName', type=str, help='Domain to block')
            parser.add_argument('isBlocked', type=int, help='Blocking or tracking')
            parser.add_argument('timeCap', type=int, help='Time before block')
            args = parser.parse_args()

            _username = args['username']
            _domainName = args['domainName']
            _isBlocked = args['isBlocked']
            _timeCap = args['timeCap']

            if _timeCap is None:
                _timeCap = 0

            conn = mysql.connect()
            cursor = conn.cursor()
            cursor.callproc('updateListedSite', (_username, _domainName, _isBlocked, _timeCap))
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                cursor.close()
                return { 'message': 'Successfully updated ListedSite' }
            else:
                return { 'statuscode': '1000', 'message': str(data[0]) }

        except Exception as e:
            return { 'error': str(e) }

class DeleteListedSite(Resource):
    def delete(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Owner of listedsite')
            parser.add_argument('domainName', type=str, help='Domain to block')
            args = parser.parse_args()

            _username = args['username']
            _domainName = args['domainName']

            conn = mysql.connect()

            cursor = conn.cursor()
            cursor.callproc('deleteListedSite', (_username, _domainName))
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                cursor.close()
            else:
                return { 'statuscode': '1000', 'message': str(data[0]) }

            cursor = conn.cursor()
            cursor.callproc('deleteSiteTimeHistory', (_username, _domainName))
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                cursor.close()
                return { 'message': 'Successfully deleted ListedSite and SiteTimeHistory' }
            else:
                return { 'statuscode': '1000', 'message': str(data[0]) }

        except Exception as e:
            return { 'error': str(e) }

class GetASiteTimeHistory(Resource):
    def get(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Owner of ListedSite')
            parser.add_argument('domainName', type=str, help='Domain to block')
            args = parser.parse_args()

            _username = args['username']
            _domainName = args['domainName']

            conn = mysql.connect()

            cursor = conn.cursor()
            cursor.callproc('getSiteTimeHistory', (_username, _domainName))
            data = cursor.fetchone()

            history = { 'owner': data[0],
                        'domainName': data[1],
                        'dailyTime_0': data[2],
                        'dailyTime_1': data[3],
                        'dailyTime_2': data[4],
                        'dailyTime_3': data[5],
                        'dailyTime_4': data[6],
                        'dailyTime_5': data[7],
                        'dailyTime_6': data[8] }

            return history

        except Exception as e:
            return { 'error': str(e) }

class GetListedSites(Resource):
    def get(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Owner of ListedSite')
            args = parser.parse_args()

            _username = args['username']

            conn = mysql.connect()

            cursor = conn.cursor()
            cursor.callproc('getListedSites', args=[_username])
            data = cursor.fetchall()

            site_list = []
            for i in data:
                site = { 'owner': i[0],
                         'domainName': i[1],
                         'dailyTime': i[2],
                         'blockedTime': i[3],
                         'isBlocked': i[4],
                         'timeCap': i[5] }
                site_list.append(site)

            return site_list

        except:
            return { 'error': str(e) }

class GetSiteTimeHistories(Resource):
    def get(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Owner of SiteTimeHistory')
            args = parser.parse_args()

            _username = args['username']

            conn = mysql.connect()

            cursor = conn.cursor()
            cursor.callproc('getSiteTimeHistories', args=[_username])
            data = cursor.fetchall()

            site_history_list = []
            for i in data:
                history = { 'owner': i[0],
                            'domainName': i[1],
                            'dailyTime_0': i[2],
                            'dailyTime_1': i[3],
                            'dailyTime_2': i[4],
                            'dailyTime_3': i[5],
                            'dailyTime_4': i[6],
                            'dailyTime_5': i[7],
                            'dailyTime_6': i[8] }

                site_history_list.append(history)

            return site_history_list

        except:
            return { 'error': str(e) }



def GetCredentials():
    home_dir = os.path.expanduser('/var/www/test_app/test_app/')
    credential_dir = os.path.join(home_dir, '.credentials')
    if not os.path.exists(credential_dir):
        os.makedirs(credential_dir)
    credential_path = os.path.join(credential_dir, 'gmail-python-quickstart.json')
    store = oauth2client.file.Storage(credential_path)
    credentials = store.get()
    if not credentials or credentials.invalid:
        flow = client.flow_from_clientsecrets(CLIENT_SECRET_FILE, SCOPES)
        flow.user_agent = APPLICATION_NAME
        flags = argparse.ArgumentParser(parents=[tools.argparser]).parse_args()

        if flags:
            credentials = tools.run_flow(flow, store, flags)
        else:
            credentials = tools.run(flow, store)
        return credentials

def CreateMessage(sender, to, subject, message_text):
    message = MIMEText(message_text)
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject
    #return {'message' : 'dd' }
    return {'raw': base64.urlsafe_b64encode(message.as_string())}





class SendEmail(Resource):

    def get(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('sender', type=str, help='Sender')
            parser.add_argument('to', type=str, help='To')
            parser.add_argument('subject', type=str, help='Subject')
            parser.add_argument('message_text', type=str, help='Message_text')
            args = parser.parse_args()

            _sender = args['sender']
            _to = args['to']
            _subject = args['subject']
            _message_text = args['message_text']
            credentials = GetCredentials()
            #http = credentials.authorize(httplib2.Http())
            #service = discovery.build('gmail', 'v1', http=http)
            #message = self.CreateMessage(_sender, _to, _subject, _message_text)
            #message = (service.users().messages().send(userId=_sender, body=message).execute())

            return { 'message': 'Success!' }

        except Exception as e:
            return { 'error': str(e) }


class DeskTab(Resource):
    def get(self):
        return {'message': 'DeskTab is up!' }

api.add_resource(DeskTab, '/')

api.add_resource(CreateUser, '/CreateUser')
api.add_resource(AddTask, '/AddTask')
api.add_resource(DeleteTask, '/DeleteTask')
api.add_resource(CheckTask, '/CheckTask')
api.add_resource(GetTask, '/GetTask')

api.add_resource(GetAListedSite, '/ListedSite/GetAListedSite')
api.add_resource(IncrementAListedSite, '/ListedSite/IncrementAListedSite')
api.add_resource(IncrementABlockedSite, '/ListedSite/IncrementABlockedSite')
api.add_resource(AddListedSite, '/ListedSite/AddListedSite')
api.add_resource(EditListedSite, '/ListedSite/EditListedSite')
api.add_resource(DeleteListedSite, '/ListedSite/DeleteListedSite')
api.add_resource(GetASiteTimeHistory, '/ListedSite/GetASiteTimeHistory')
api.add_resource(GetListedSites, '/ListedSite/GetListedSites')
api.add_resource(GetSiteTimeHistories, '/ListedSite/GetSiteTimeHistories')

api.add_resource(SendEmail, '/SendEmail')

if __name__ == '__main__':
    context = ('desktab_me.ca-bundle.crt', 'desktab.me.key')
    app.run(debug=True, ssl_context=context)
