use wasm_bindgen::prelude::*;
use diplomacy::geo::{standard_map, RegionKey};
use diplomacy::judge::{MappedMainOrder, Rulebook, Submission};
use diplomacy::judge::retreat::{Start as RetreatStart, DestStatus};
use diplomacy::judge::OrderState;
use diplomacy::order::Command;
use diplomacy::ShortName;
use serde::Serialize;

#[derive(Serialize)]
struct UnitResult {
    unit: String,
    order: String,
    succeeded: bool,
    new_position: String,
    dislodged_by: Option<String>,
    retreat_options: Vec<String>,
    explanation: String,
}

#[derive(Serialize)]
struct AdjudicationSummary {
    unit_results: Vec<UnitResult>,
}

#[derive(Serialize)]
struct RetreatResult {
    unit: String,                 // e.g., "FRA A par"
    from: String,                // original region
    attempted: Option<String>,   // where it tried to go (None if none submitted)
    succeeded: bool,             // did the retreat succeed
    final_position: Option<String>, // new region if successful, None if disbanded
}

#[wasm_bindgen]
pub fn adjudicate_with_input(order_list: JsValue) -> Result<JsValue, JsValue> {
    let order_strings: Vec<String> = order_list.into_serde()
        .map_err(|e| JsValue::from_str(&format!("Failed to parse input: {}", e)))?;

    let map = standard_map();

    let parsed_orders: Vec<MappedMainOrder> = order_strings.iter()
        .map(|s| s.parse().expect("Expected valid orders"))
        .collect();

        let submission = Submission::with_inferred_state(map, parsed_orders.clone());
    let outcome = submission.adjudicate(Rulebook);
    let retreat = RetreatStart::new(&outcome);

    let mut unit_results = Vec::new();
    

    for order in &parsed_orders {
        let unit = format!(
            "{} {} {}",
            order.nation.short_name(),
            order.unit_type.short_name(),
            order.region.short_name()
        );
        let order_str = format!("{}", order);

        let succeeded = outcome
            .get(order)
            .map(|o| OrderState::from(o) == OrderState::Succeeds)
            .unwrap_or(false);

        let new_position = if succeeded {
            order
                .move_dest()
                .map(|r| r.short_name().to_string())
                .unwrap_or_else(|| order.region.short_name().to_string())
        } else {
            order.region.short_name().to_string()
        };

        let dislodged_by = retreat
            .dislodged()
            .get(order)
            .map(|attacker| format!(
                "{} {} {}",
                attacker.nation.short_name(),
                attacker.unit_type.short_name(),
                attacker.region.short_name()
            ));

        let retreat_options = retreat
            .retreat_destinations()
            .get(&order.unit_position())
            .map(|dests| {
                dests
                    .available()
                    .into_iter()
                    .map(|r| r.short_name().to_string())
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default();

        let explanation = match outcome.get(order) {
            Some(outcome) => format!("{:?}", outcome),
            None => "Missing outcome".to_string(),
        };
            

        unit_results.push(UnitResult {
            unit,
            order: order_str,
            succeeded,
            new_position,
            dislodged_by,
            retreat_options,
            explanation,
        });
    }

    JsValue::from_serde(&AdjudicationSummary { unit_results })
        .map_err(|e| JsValue::from_str(&format!("Serialization failed: {}", e)))
}
