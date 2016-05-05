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
    def get(self):
        return { 'message': 'HELLO WORLD' }
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

# Note: This request ensures that the data is consistent with the database
# It will only increment dailyTime if the client's dailyTime is the same
# If it returns successfully (not a None object), it will return the
# incremented dailyTime to be used to update your ListedSite object.
# Otherwise the request should be treated as a failure and the client-side
# dailyTime should not be changed.
class IncrementAListedSite(Resource):
    def put(self):
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
            data = cursor.fetchone()

            if data is None or data[2] == _dailyTime:
                return { 'error': 'Failed to update time, check your dailyTime' }
            else:
                site = { 'owner': data[0],
                         'domainName': data[1],
                         'dailyTime': data[2],
                         'isBlocked': data[3],
                         'timeCap': data[4] }
                return site

        except Exception as e:
            return { 'error': str(e) }


api.add_resource(CreateUser, '/CreateUser')
api.add_resource(AddTask, '/AddTask')
api.add_resource(DeleteTask, '/DeleteTask')
api.add_resource(CheckTask, '/CheckTask')
api.add_resource(GetTask, '/GetTask')

api.add_resource(GetAListedSite, '/ListedSite/GetAListedSite')
api.add_resource(IncrementAListedSite, '/ListedSite/IncrementAListedSite')
if __name__ == '__main__':
    app.run(debug=True)

