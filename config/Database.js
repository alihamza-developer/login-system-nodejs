import mysql from "sync-mysql";
import rtrim from 'rtrim';
import htmlspecialchars from 'htmlspecialchars';
import dotenv from "dotenv";
import moment from 'moment';
import {
	isObjectEmpty,
	htmlspecialcharsDecode,
	trim,
	objVal,
	isObject,
	createKey,
	addSlashes
} from "../utils/functions.js";

class Database {
	#con;
	#queries = [];
	#err;

	constructor() {
		dotenv.config();

		try {
			this.#con = new mysql({
				host: process.env.DB_HOST,
				user: process.env.DB_USER,
				password: process.env.DB_PASSWORD,
				database: process.env.DB_NAME
			});
		} catch (e) {
			this.#err = e.toString();
		}
	}

	getError() {
		return this.#err;
	}

	// Validation
	validText(data, encodeHtml = true) {
		if (typeof data !== 'string') return data;
		data = trim(data);
		data = addSlashes(data);
		if (encodeHtml) {
			data = htmlspecialchars(data);
		}
		return data;
	}

	validPhone(data) {
		return data.replace(/[^0-9+]/g, "");
	}

	validNum(data) {
		return data.replace(/[^0-9]/g, "");
	}

	getTime(datetime) {
		return moment(new Date(datetime)).format("DD MMMM, YYYY");
	}

	toTimestamp(time) {
		return moment(time).format("YYYY-MM-DD HH:mm:ss");
	}

	jsonDecode(json) {
		json = htmlspecialcharsDecode(json);
		try {
			json = JSON.parse(json);
		} catch {
			return null;
		}
		return json;
	}

	// Add Backticks
	coverStr(data, char, join_with = null) {
		if (isObject(data)) {
			for (const key in data) {
				if (Object.hasOwnProperty.call(data, key)) {
					const val = data[key];
					data[key] = char + val + char;
				}
			}
			return data;
		} else if (Array.isArray(data)) {

			for (let i = 0; i < data.length; i++) {
				const el = data[i];
				data[i] = char + el + char;
			}

			if (join_with) data = data.join(join_with);
			return data;
		}
		return char + data + char;
	}

	get(type, data = {}) {
		if (type === "whereQuery") {
			let conditions = objVal(data, "condition", {}),
				limit = objVal(data, "limit", ""),
				offset = objVal(data, "offset", false),
				orderBy = objVal(data, "orderBy", ""),
				conditionOperator = objVal(data, 'conditionOperator', "="),
				logicalOperator = objVal(data, 'logicalOperator', "AND"),
				where = "";

			limit = objVal(data, "singleRecord") ? 1 : limit;

			if (!isObjectEmpty(conditions)) {
				where = "WHERE ";
				for (let column in conditions) {
					if (Object.hasOwnProperty.call(conditions, column)) {
						let data = conditions[column];

						column = column.indexOf('(') !== -1 ? column : "`" + column + "`";

						if (isObject(data)) {

							let operator = objVal(data, "operator", conditionOperator),
								lOperator = objVal(data, "logicalOperator", logicalOperator),
								tempData = data.value;

							if (Array.isArray(tempData)) {
								let tempWhere = '';

								tempData.forEach(value => {
									value = this.validText(value);
									tempWhere += ` ${column} ${operator} '${value}' ${lOperator}`;
								});

								tempWhere = rtrim(tempWhere, lOperator);

								where += ` ( ${tempWhere} ) ${logicalOperator}`;
							} else {

								let tOperator = operator.toLowerCase();

								if (['in'].includes(tOperator)) {
									where += ` ${column} ${operator} ${tempData} ${lOperator}`;
								} else {
									tempData = this.validText(tempData);
									where += ` ${column} ${operator} '${tempData}' ${lOperator}`;
								}

							}

						} else {

							data = this.validText(data);
							where += ` ${column} ${conditionOperator} '${data}' ${logicalOperator}`;

						}

					}
				}
				where = rtrim(where, logicalOperator);
			}

			if (orderBy) where += ` ORDER BY ${orderBy}`;

			if (limit) where += ` LIMIT ${limit}`;

			if (offset) where += ` OFFSET ${offset}`;

			return where;

		} else if (type === "updateDataStr") {

			let updateDataStr = '',
				updateData = data.data,
				encodeHtml = objVal(data, "encodeHtml", true);

			for (let column in updateData) {
				if (Object.hasOwnProperty.call(updateData, column)) {
					let value = updateData[column];

					if (isObject(value)) {
						let thisEncodeHtml = objVal(value, "encodeHtml", encodeHtml);

						value = value.value;
						value = this.validText(value, thisEncodeHtml);
						updateDataStr += " `" + column + "`='" + value + "',";

					} else {
						value = this.validText(value, encodeHtml);
						updateDataStr += " `" + column + "`='" + value + "',";
					}
				}
			}

			updateDataStr = rtrim(updateDataStr, ",");

			return updateDataStr;
		} else if (type === "insertDataStr") {
			let columns = [],
				rows = [],
				dataRows = data.data,
				encodeHtml = objVal(data, "encodeHtml", true);

			dataRows.forEach(record => {
				let values = [];

				for (let key in record) {
					if (Object.hasOwnProperty.call(record, key)) {
						let value = record[key],
							thisEncodeHtml = encodeHtml,
							rowData = value;

						if (isObject(value)) {
							thisEncodeHtml = objVal(value, "encodeHtml", encodeHtml);
							rowData = value.value;
						}

						rowData = this.validText(rowData, thisEncodeHtml);
						if (!columns.includes(key)) columns.push(key);
						values.push(rowData);
					}
				}

				rows.push(values);
			});

			columns = this.coverStr(columns, "`");

			let columnsStr = "\n(" + columns.join(",") + ")",
				rowsStr = "";

			rows.forEach(row => {
				row = this.coverStr(row, "'");
				rowsStr += "\n(" + row.join(",") + "),";
			});

			rowsStr = rtrim(rowsStr, ",");

			return `${columnsStr} VALUES ${rowsStr};`;

		}
	}

	// Execute Select Query
	query(query, options = {}) {
		let selectQuery = objVal(options, 'selectQuery'),
			data;

		if (!selectQuery) selectQuery = objVal(options, 'records');

		try {

			data = this.#con.query(query);
			this.#queries.push(query);

		} catch (err) {
			this.#err = err.toString();
			return false;
		}

		return data;

	}

	// Select Function
	select(table, selectData = [], condition = {}, options = {}) {

		if (Array.isArray(selectData)) {

			if (selectData.length > 0) {

				let columns = '';

				selectData.forEach(column => {
					let key = column.toLowerCase();
					if (column.indexOf(" as ") === -1) {
						column = trim(column, '`');
						columns += "`" + column + "`,";
					} else {
						columns += column + ",";
					}
				});

				selectData = rtrim(columns, ',');

			} else selectData = '*';
		}

		options.data = selectData;
		options.condition = condition;

		let columns = objVal(options, "data", "*"),
			returnQuery = objVal(options, "query"),
			whereCondition = this.get("whereQuery", options),
			singleRecord = objVal(options, "singleRecord"),
			query = `SELECT ${columns} FROM ${table} ${whereCondition}`;

		if (returnQuery) return query;

		let records = this.query(query, { 'selectQuery': true });
		if (!singleRecord) return records;
		if (records.length) return records[0];
		return false;
	}

	// Select one record
	selectOne(table, data = ['*'], condition = {}, options = {}) {

		options.singleRecord = true;

		let record = this.select(table, data, condition, options);
		if (Object.keys(options).includes("default")) {
			data = trim(data, '`');
			if (record) return record[data];
			return options.default;
		}

		if (record) return record;

		return record;
	}

	// count function
	count(table, data = {}) {
		data = {
			'condition': data
		};

		data.data = "COUNT(1) as recordsCount";
		data.singleRecord = true;

		let record = this.select(table, data);

		if (!isObject(record)) return 0;

		return parseInt(record.recordsCount);
	}

	// Update data
	update(table, data = {}, condition = {}, options = {}) {
		let returnQuery = objVal(options, "query"),
			whereCondition = this.get("whereQuery", { 'condition': condition });

		options.data = data;

		// Update Data
		let updateData = this.get("updateDataStr", options),
			query = `UPDATE ${table} SET ${updateData} ${whereCondition}`;

		if (returnQuery) return query;

		let updated = this.query(query);

		if (updated) {
			return updated.affectedRows > 0;
		}

		return false;
	}

	// Delete Data
	delete(table, condition = [], data = []) {
		let returnQuery = objVal(data, "query");

		data.condition = condition;

		let whereCondition = this.get("whereQuery", data),
			query = `DELETE FROM ${table} ${whereCondition}`;

		if (returnQuery) return query;

		let deleted = this.query(query);

		if (deleted) {
			return deleted.affectedRows > 0;
		}

		return false;
	}

	// Update Uid
	updateUid(table, insertId) {
		let data = this.selectOne(table, "*", { 'id': insertId });
		if (data) {
			let ids = ['encrypt_id', 'uid'];
			ids.forEach(uid => {
				if (Object.keys(data).includes(uid)) {
					let key = createKey(100),
						dbData = {};

					dbData[uid] = key;

					let exists = this.selectOne(table, "id", dbData);

					if (exists) {
						return this.updateUid(table, insertId);
					}

					this.update(table, dbData, { 'id': insertId });
				}
			});
		}
	}

	// Insert Data
	insert(table, data = {}, options = {}) {
		let returnQuery = objVal(options, "query"),
			multipleData = objVal(options, "multiple"),
			updateUid = objVal(options, 'updateUid', true);

		if (!multipleData) data = [data];

		options.data = data;

		let insertDataStr = this.get("insertDataStr", options),
			query = `INSERT INTO ${table} ${insertDataStr}`;

		if (returnQuery) return query;

		let insert = this.query(query);

		if (insert) {
			let insertId = insert.insertId;
			if (updateUid)
				this.updateUid(table, insertId);

			return insertId;
		}

		return false;
	}

	// Save Data if not exists
	save(table, data, condition) {
		let saved = false,
			exists = this.selectOne(table, 'id', condition);

		if (exists) {
			saved = this.update(table, data, condition);
			if (Object.keys(exists).includes('id')) saved = exists.id;
		} else {
			Object.assign(data, condition);
			saved = this.insert(table, data);
		}

		return saved;
	}

	// Toggle Data - If exists delete data else insert Data
	toggle(table, condition, data = {}) {
		let action = false,
			exists = this.selectOne(table, 'id', condition);

		if (exists) {
			action = this.delete(table, condition);
		} else {
			Object.assign(data, condition);
			action = this.insert(table, data);
		}

		return action;
	}

	// Get Last Query
	lastQuery() {
		if (this.#queries.length === 0) return null;
		return this.#queries.at(-1);
	}

	// Convert object array to simple array
	objToArray(objArray, key) {
		let newArray = [];

		objArray.forEach(value => {
			newArray.push(value[key]);
		});

		return newArray;
	}

	getUid(table, insertId) {
		return this.selectOne(table, "uid", { 'id': insertId }, { "default": "" });
	}

}

export default new Database();