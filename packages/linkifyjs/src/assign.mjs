/**
 * @template A
 * @template B
 * @param {A} target
 * @param {B} properties
 * @return {A & B}
 */
const assign = (target, properties) => {
	for (const key in properties) {
		target[key] = properties[key];
	}
	return target;
};

export default assign;
