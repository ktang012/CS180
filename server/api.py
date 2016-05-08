from OpenSSL import SSL
from flask import Flask, jsonify
from flask_restful import Resource, Api, reqparse
from flask.ext.mysql import MySQL
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
                     'isBlocked': data[3],
                     'timeCap': data[4] }

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
                     'isBlocked': data[3],
                     'timeCap': data[4] }

            return site

        except Exception as e:
            return { 'error': str(e) }

class AddListedSite(Resource):
    def post(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Owner of listedsite')
            parser.add_argument('domainName', type=str, help='Domain to block')
            parser.add_argument('isBlocked', type=int, help='Blocking or tracking')
            parser.add_argument('timeCap', type=int, help='Time before block')
            args = parser.parser_args()

            _username = args['username']
            _domainName = args['domainName']
            _isBlocked = args['isBlocked']
            _timeCap = args['timeCap']

            conn = mysql.connect()

            cursor = conn.cursor()
            cursor.callproc('createListedSite', (_username, _domainName, _isBlocked, _timeCap))
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                cursor.close()
            else:
                return { 'statuscode': '1000', 'message': str(data[0]) }

            cursor = conn.cursor()
            cursor.callproc('createSiteTimeHistory', (_username, _domainName))
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                cursor.close()
            else:
                return { 'statuscode': '1000', 'message': str(data[0]) }

        except Exception as e:
            return { 'error': str(e) }

class EditListedSite(Resource):
    def post(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Owner of listedsite')
            parser.add_argument('domainName', type=str, help='Domain to block')
            parser.add_argument('isBlocked', type=int, help='Blocking or tracking')
            parser.add_argument('timeCap', type=int, help='Time before block')
            args = parser.parser_args()

            _username = args['username']
            _domainName = args['domainName']
            _isBlocked = args['isBlocked']
            _timeCap = args['timeCap']

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
            args = parser.parser_args()

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
            parser.add_argument('username', type=str, help='Owner of listedsite')
            parser.add_argument('domainName', type=str, help='Domain to block')
            args = parser.parser_args()

            _username = args['username']
            _domainName = args['domainName']

            conn = mysql.connect()

            cursor = conn.cursor()
            cursor.callproc('getSiteTimeHistory', (_username, _domainName))
            data = cursor.fetchall()

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
if __name__ == '__main__':
    context = ('desktab_me.ca-bundle.crt', 'desktab.me.key')
    app.run(debug=True, ssl_context=context)
